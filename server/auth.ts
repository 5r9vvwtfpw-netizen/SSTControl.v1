import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, UserRole } from "@shared/schema";
import { hasPermission, Permission } from "@shared/permissions";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { db } from "./db";
import * as schema from "@shared/schema";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { loginRateLimiter, passwordResetRateLimiter, registrationRateLimiter } from "./middleware/rate-limit";
import logger from "./lib/logger";

const registrationSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  companyName: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres").optional(),
  plan: z.enum(["microempresa", "pequena", "mediana", "grande"]).optional().default("microempresa"),
  quoteToken: z.string().optional(),
});

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Helper function to remove password from user object for API responses
function stripPassword(user: SelectUser): Omit<SelectUser, "password"> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Exported session middleware for WebSocket authentication
let sessionMiddleware: ReturnType<typeof session> | null = null;

export function getSessionMiddleware() {
  return sessionMiddleware;
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 12
    }
  };

  // Create and store session middleware for WebSocket use
  sessionMiddleware = session(sessionSettings);

  app.set("trust proxy", 1);
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // User no longer exists - invalidate session
        logger.warn("Session references non-existent user");
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      logger.error({ err: error }, "Error deserializing user");
      done(null, false);
    }
  });

  app.post("/api/register", registrationRateLimiter, async (req, res, next) => {
    try {
      // Validate request body with Zod schema
      const validationResult = registrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: errors });
      }
      const { username, password, email, fullName, companyName, plan, quoteToken } = validationResult.data;

      // Check if email already exists - handle intelligently for first-time company registration
      const existingEmailUser = await storage.getUserByEmail(email);
      if (existingEmailUser) {
        // If user exists but hasn't created a company yet, guide them to login
        if (!existingEmailUser.companyId) {
          // Check if email is verified
          if (!existingEmailUser.emailVerifiedAt) {
            return res.status(400).json({ 
              error: "Ya tienes una cuenta pendiente de verificación. Revisa tu correo electrónico para el enlace de verificación, o usa 'Iniciar Sesión' si ya verificaste tu cuenta.",
              code: "PENDING_VERIFICATION",
              canResend: true
            });
          }
          return res.status(400).json({ 
            error: "Ya tienes una cuenta registrada con este correo. Inicia sesión para continuar creando tu empresa.",
            code: "ACCOUNT_EXISTS_NO_COMPANY",
            canLogin: true
          });
        }
        // User has a company already
        return res.status(400).json({ 
          error: "Este correo electrónico ya está asociado a una empresa registrada. Por favor inicia sesión con tu cuenta existente.",
          code: "ACCOUNT_EXISTS_WITH_COMPANY",
          canLogin: true
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ 
          error: "Este nombre de usuario ya está en uso. Por favor elige otro diferente.",
          code: "USERNAME_EXISTS"
        });
      }

      // Generate verification token (32 bytes = 64 hex chars)
      const verificationToken = randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Check if we're in development mode with auto-verify enabled
      const isDevelopment = process.env.NODE_ENV === 'development';
      const autoVerifyEmail = process.env.AUTO_VERIFY_EMAIL === 'true';

      // NEW FLOW: Create user WITHOUT company
      // The superusuario will create their company after login (onboarding)
      // This ensures they enter real company data (NIT, name, etc.)
      // The trial subscription is created when they create their company
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        role: "superusuario",
        fullName: fullName || undefined,
        email,
        department: undefined,
        companyId: undefined, // No company yet - user will create it during onboarding
        workerId: undefined,
      });
      
      logger.info("Usuario superusuario creado (sin empresa - pendiente onboarding)");

      const selectedPlanValue = quoteToken ? JSON.stringify({ plan, quoteToken }) : plan;

      // In development with AUTO_VERIFY_EMAIL, auto-verify the user
      if (isDevelopment && autoVerifyEmail) {
        await db.update(users)
          .set({
            emailVerifiedAt: new Date(),
            emailVerificationToken: null,
            emailVerificationExpires: null,
            selectedPlan: selectedPlanValue,
          })
          .where(eq(users.id, user.id));

        logger.info("[DEV] Usuario auto-verificado (AUTO_VERIFY_EMAIL=true)");

        return res.status(201).json({ 
          message: "Usuario registrado y verificado exitosamente. Puedes iniciar sesión ahora.",
          username,
          emailSent: false,
          autoVerified: true,
        });
      }

      await db.update(users)
        .set({
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
          selectedPlan: selectedPlanValue,
        })
        .where(eq(users.id, user.id));

      // Build verification URL - use request origin for correct domain in any environment
      const baseUrl = process.env.VITE_APP_URL
        || `${req.protocol}://${req.get('host')}`;
      const verificationUrl = `${baseUrl}/api/verify-email?token=${verificationToken}`;

      logger.info({ baseUrl, verificationUrl: verificationUrl.substring(0, 80) }, "Verification URL built");

      // Send verification email
      const emailResult = await sendVerificationEmail(email, {
        fullName: fullName || username,
        verificationUrl: verificationUrl,
      });

      if (!emailResult.success) {
        logger.error({ err: emailResult.error, email }, "Failed to send verification email");
      } else {
        logger.info({ email }, "Verification email sent successfully");
      }

      // Return success without auto-login
      res.status(201).json({ 
        message: "Usuario registrado exitosamente. Revisa tu correo electrónico para verificar tu cuenta.",
        username,
        emailSent: emailResult.success,
        emailError: emailResult.success ? undefined : "No se pudo enviar el correo de verificación. Por favor contacta soporte.",
      });
    } catch (error: any) {
      logger.error({ err: error }, "Registration error");
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });

  // Email verification endpoint
  app.get("/api/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        return res.redirect("/auth?error=invalid_token");
      }

      // Find user by verification token
      const [user] = await db.select()
        .from(users)
        .where(eq(users.emailVerificationToken, token));

      if (!user) {
        return res.redirect("/auth?error=invalid_token");
      }

      // Check if token has expired
      if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
        return res.redirect("/auth?error=token_expired");
      }

      // Mark email as verified
      await db.update(users)
        .set({
          emailVerifiedAt: new Date(),
          emailVerificationToken: null,
          emailVerificationExpires: null,
        })
        .where(eq(users.id, user.id));

      // Redirect to login with success message and pre-fill username
      res.redirect(`/auth?verified=true&user=${encodeURIComponent(user.username)}`);
    } catch (error: any) {
      logger.error({ err: error }, "Email verification error");
      res.redirect("/auth?error=verification_failed");
    }
  });

  app.post("/api/resend-verification", registrationRateLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Se requiere un correo electrónico" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "Si el correo existe, se reenviará el enlace de verificación.", sent: true });
      }

      if (user.emailVerifiedAt) {
        return res.json({ message: "Tu correo ya está verificado. Puedes iniciar sesión.", alreadyVerified: true });
      }

      const verificationToken = randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.update(users)
        .set({
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        })
        .where(eq(users.id, user.id));

      const baseUrl = process.env.VITE_APP_URL
        || `${req.protocol}://${req.get('host')}`;
      const verificationUrl = `${baseUrl}/api/verify-email?token=${verificationToken}`;

      logger.info({ email, baseUrl }, "Resending verification email");

      const emailResult = await sendVerificationEmail(email, {
        fullName: user.fullName || user.username,
        verificationUrl,
      });

      if (!emailResult.success) {
        logger.error({ err: emailResult.error, email }, "Failed to resend verification email");
        return res.status(500).json({ error: "No se pudo enviar el correo. Intenta de nuevo en unos minutos." });
      }

      logger.info({ email }, "Verification email resent successfully");
      res.json({ message: "Correo de verificación reenviado exitosamente. Revisa tu bandeja de entrada.", sent: true });
    } catch (error: any) {
      logger.error({ err: error }, "Resend verification error");
      res.status(500).json({ error: "Error al reenviar correo de verificación" });
    }
  });

  app.post("/api/login", loginRateLimiter, (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        logger.error({ err }, "Login error");
        return res.status(500).json({ error: "Error del servidor" });
      }
      
      if (!user) {
        logger.warn("Login failed - invalid credentials");
        return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      }
      
      // Block support-only users from regular login - they must use /api/support-login
      if (user.role === 'soporte') {
        logger.warn("Support user attempted regular login");
        return res.status(403).json({ 
          error: "Por favor use el portal de soporte para iniciar sesión" 
        });
      }

      // Block login if email is not verified (except system/auto-provisioned accounts)
      const autoVerifiedRoles = ['admin', 'superadmin', 'lso', 'trabajador', 'soporte'];
      if (!user.emailVerifiedAt && !autoVerifiedRoles.includes(user.role)) {
        logger.warn({ username: user.username }, "Login blocked - email not verified");
        return res.status(403).json({ 
          error: "Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada (incluyendo Spam) para el enlace de verificación.",
          code: "EMAIL_NOT_VERIFIED",
          canResend: true,
          email: user.email
        });
      }
      
      req.session.regenerate((err) => {
        if (err) {
          logger.error({ err }, "Session regeneration error");
          return res.status(500).json({ error: "Error al crear la sesión segura" });
        }
        
        req.logIn(user, async (err) => {
          if (err) {
            logger.error({ err }, "Session login error");
            return res.status(500).json({ error: "Error al crear la sesión" });
          }
          
          try {
            const clientIp = req.ip || req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress || 'unknown';
            await db.update(schema.users)
              .set({
                lastLoginAt: new Date(),
                loginCount: sql`COALESCE(login_count, 0) + 1`,
                lastLoginIp: clientIp,
              })
              .where(eq(schema.users.id, user.id));
          } catch (trackErr) {
            logger.error({ err: trackErr }, "Error tracking login");
          }
          
          logger.info({ role: user.role }, "Login successful");
          return res.status(200).json(stripPassword(user));
        });
      });
    })(req, res, next);
  });

  // Dedicated support login endpoint - only allows soporte and superadmin roles
  app.post("/api/support-login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        logger.error({ err }, "Support login error");
        return res.status(500).json({ error: "Error del servidor" });
      }
      
      if (!user) {
        logger.warn("Support login failed - invalid credentials");
        return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      }
      
      // Only allow support roles (soporte, superadmin) through this endpoint
      if (user.role !== 'soporte' && user.role !== 'superadmin') {
        logger.warn({ role: user.role }, "Support login rejected - not a support role");
        return res.status(403).json({ 
          error: "Este portal es exclusivo para personal de soporte" 
        });
      }

      // Support users are created by superadmin directly - no email verification needed
      // Only regular users need email verification through the main login flow
      
      req.session.regenerate((err) => {
        if (err) {
          logger.error({ err }, "Support session regeneration error");
          return res.status(500).json({ error: "Error al crear la sesión segura" });
        }
        
        req.logIn(user, async (err) => {
          if (err) {
            logger.error({ err }, "Support session login error");
            return res.status(500).json({ error: "Error al crear la sesión" });
          }
          
          try {
            const clientIp = req.ip || req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress || 'unknown';
            await db.update(schema.users)
              .set({
                lastLoginAt: new Date(),
                loginCount: sql`COALESCE(login_count, 0) + 1`,
                lastLoginIp: clientIp,
              })
              .where(eq(schema.users.id, user.id));
          } catch (trackErr) {
            logger.error({ err: trackErr }, "Error tracking support login");
          }
          
          logger.info({ role: user.role }, "Support login successful");
          return res.status(200).json(stripPassword(user));
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = req.user as SelectUser;
    const userWithoutPassword = stripPassword(user);
    
    // Add verification status fields for progressive access
    const emailVerified = !!user.emailVerifiedAt;
    
    // Check company profile completeness
    let profileComplete = false;
    let subscriptionStatus = null;
    
    if (user.companyId) {
      const company = await storage.getCompany(user.companyId);
      profileComplete = !!(company?.name && company?.nit && company?.city && company?.address);
      
      // Get subscription status
      try {
        const { getSubscriptionStatus } = await import("./middleware/subscription-check");
        subscriptionStatus = await getSubscriptionStatus(user.companyId);
      } catch (error) {
        logger.error({ error }, "Error getting subscription status");
      }
    }
    
    let isDemoSession = false;
    if (user.companyId) {
      try {
        const { DEMO_COMPANY_IDS } = await import("../plugins/demo-engine/types");
        isDemoSession = DEMO_COMPANY_IDS.includes(user.companyId as any);
      } catch {}
    }

    res.json({
      ...userWithoutPassword,
      emailVerified,
      profileComplete,
      subscriptionStatus,
      isDemoSession,
    });
  });

  // Change password for authenticated user
  app.post("/api/change-password", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user as SelectUser;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
      }

      // Verify current password
      const isValid = await comparePasswords(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "La contraseña actual es incorrecta" });
      }

      // Hash new password and update
      const hashedPassword = await hashPassword(newPassword);
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));

      logger.info("Password changed successfully");
      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error: any) {
      logger.error({ err: error }, "Change password error");
      res.status(500).json({ error: "Error al cambiar la contraseña" });
    }
  });

  // Password reset request - sends email with reset link
  app.post("/api/auth/request-password-reset", passwordResetRateLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Correo electrónico requerido" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration attacks
      if (!user) {
        logger.warn("Password reset requested for non-existent email");
        return res.status(200).json({ 
          message: "Si existe una cuenta con ese correo, recibirás un enlace de recuperación" 
        });
      }

      // Generate reset token (32 bytes = 64 hex chars)
      const resetToken = randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save token to database
      await db.update(users)
        .set({
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        })
        .where(eq(users.id, user.id));

      // Build reset URL - use request origin for correct domain in any environment
      const baseUrl = process.env.VITE_APP_URL
        || `${req.protocol}://${req.get('host')}`;
      const resetUrl = `${baseUrl}/restablecer-contrasena?token=${resetToken}`;

      // Send reset email
      const emailResult = await sendPasswordResetEmail(user.email!, {
        fullName: user.fullName || user.username,
        resetUrl: resetUrl,
      });

      if (!emailResult.success) {
        logger.error({ err: emailResult.error }, "Failed to send password reset email");
      }

      logger.info("Password reset email sent");
      res.status(200).json({ 
        message: "Si existe una cuenta con ese correo, recibirás un enlace de recuperación" 
      });
    } catch (error: any) {
      logger.error({ err: error }, "Password reset request error");
      res.status(500).json({ error: "Error al procesar la solicitud" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Token inválido" });
      }

      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
      }

      // Find user by reset token
      const [user] = await db.select()
        .from(users)
        .where(eq(users.passwordResetToken, token));

      if (!user) {
        return res.status(400).json({ error: "El enlace de recuperación no es válido" });
      }

      // Check if token has expired
      if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
        return res.status(400).json({ error: "El enlace de recuperación ha expirado. Solicita uno nuevo." });
      }

      // Hash new password and update user
      const hashedPassword = await hashPassword(newPassword);
      await db.update(users)
        .set({
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        })
        .where(eq(users.id, user.id));

      logger.info("Password reset successful");
      res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    } catch (error: any) {
      logger.error({ err: error }, "Password reset error");
      res.status(500).json({ error: "Error al restablecer la contraseña" });
    }
  });
}

// Middleware para requerir autenticación
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
}

// Middleware para requerir un permiso específico
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const user = req.user as SelectUser;
    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ 
        error: "No tienes permisos para realizar esta acción",
        requiredPermission: permission 
      });
    }

    next();
  };
}

// Middleware para requerir uno de varios permisos
export function requireAnyPermission(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const user = req.user as SelectUser;
    const hasAny = permissions.some(permission => hasPermission(user.role, permission));
    
    if (!hasAny) {
      return res.status(403).json({ 
        error: "No tienes permisos para realizar esta acción",
        requiredPermissions: permissions 
      });
    }

    next();
  };
}

// Middleware para requerir un rol específico o superior
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const user = req.user as SelectUser;
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: "No tienes el rol necesario para realizar esta acción",
        requiredRoles: allowedRoles 
      });
    }

    next();
  };
}

// Middleware para requerir acceso de superadmin (proveedor SaaS)
// Solo superadmin puede acceder a funcionalidades de administración global del sistema
export function requireSuperadmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const user = req.user as SelectUser;
  if (user.role !== 'superadmin') {
    return res.status(403).json({ 
      error: "Acceso denegado. Esta funcionalidad es exclusiva para administradores del sistema.",
      requiredRole: 'superadmin'
    });
  }

  next();
}

// Middleware para bloquear acciones de escritura a trabajadores
export function blockWorkerWrites(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const user = req.user as SelectUser;
  
  // Si el usuario es trabajador, bloquear métodos POST, PUT, PATCH, DELETE
  if (user.role === 'trabajador' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(403).json({ 
      error: "Los trabajadores solo tienen acceso de solo lectura a esta información"
    });
  }

  next();
}

// Helper para verificar si el usuario debe ver solo su propia información
export function shouldFilterByWorker(user: SelectUser): boolean {
  return user.role === 'trabajador' && user.workerId !== null;
}

// Helper para obtener el workerId del usuario autenticado
export function getWorkerIdFromUser(user: SelectUser): string | null {
  return user.workerId;
}

// ============================================================================
// MIDDLEWARE DE SEGURIDAD - Protección de API contra acceso no autorizado
// ============================================================================

/**
 * Middleware para requerir suscripción activa
 * Verifica que el usuario esté autenticado Y tenga una suscripción activa o en trial
 * 
 * Respuestas:
 * - 401: Usuario no autenticado
 * - 403: Suscripción inactiva, vencida o cancelada
 * - 500: Error interno al verificar suscripción
 */
export function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: "No autenticado",
      code: "AUTH_REQUIRED",
      message: "Debe iniciar sesión para acceder a este recurso"
    });
  }

  const user = req.user as SelectUser;
  
  // Superadmin y soporte no requieren suscripción (administradores del sistema)
  if (user.role === 'superadmin' || user.role === 'soporte') {
    return next();
  }

  // Verificar que el usuario tenga empresa asignada
  if (!user.companyId) {
    return res.status(403).json({ 
      error: "Sin empresa asignada",
      code: "NO_COMPANY",
      message: "Su cuenta no está asociada a ninguna empresa"
    });
  }

  // Verificar suscripción activa de forma asíncrona
  verifySubscriptionStatus(user.companyId)
    .then(subscriptionStatus => {
      if (!subscriptionStatus.isValid) {
        return res.status(403).json({ 
          error: "Suscripción inactiva",
          code: subscriptionStatus.code,
          message: subscriptionStatus.message,
          subscriptionStatus: subscriptionStatus.status
        });
      }
      next();
    })
    .catch(error => {
      logger.error({ err: error }, "Error verificando suscripción");
      return res.status(500).json({ 
        error: "Error al verificar suscripción",
        code: "SUBSCRIPTION_CHECK_ERROR"
      });
    });
}

/**
 * Middleware combinado para APIs de SST
 * Requiere: Autenticación + Permiso específico + Suscripción activa
 */
export function requireSstApiAccess(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Verificar autenticación
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        error: "No autenticado",
        code: "AUTH_REQUIRED",
        message: "Debe iniciar sesión para acceder a este recurso"
      });
    }

    const user = req.user as SelectUser;
    
    // 2. Superadmin tiene acceso total
    if (user.role === 'superadmin') {
      return next();
    }

    // 3. Verificar permiso
    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ 
        error: "Permiso denegado",
        code: "PERMISSION_DENIED",
        message: "No tiene permisos para realizar esta acción",
        requiredPermission: permission
      });
    }

    // 4. Verificar empresa asignada
    if (!user.companyId) {
      return res.status(403).json({ 
        error: "Sin empresa asignada",
        code: "NO_COMPANY",
        message: "Su cuenta no está asociada a ninguna empresa"
      });
    }

    // 5. Verificar suscripción activa
    try {
      const subscriptionStatus = await verifySubscriptionStatus(user.companyId);
      if (!subscriptionStatus.isValid) {
        return res.status(403).json({ 
          error: "Suscripción inactiva",
          code: subscriptionStatus.code,
          message: subscriptionStatus.message,
          subscriptionStatus: subscriptionStatus.status
        });
      }
      next();
    } catch (error) {
      logger.error({ err: error }, "Error verificando suscripción");
      return res.status(500).json({ 
        error: "Error al verificar suscripción",
        code: "SUBSCRIPTION_CHECK_ERROR"
      });
    }
  };
}

/**
 * Función helper para verificar el estado de la suscripción
 */
async function verifySubscriptionStatus(companyId: string): Promise<{
  isValid: boolean;
  status: string;
  code: string;
  message: string;
}> {
  const subscription = await storage.getSubscriptionByCompany(companyId);
  
  if (!subscription) {
    return {
      isValid: false,
      status: 'none',
      code: 'NO_SUBSCRIPTION',
      message: 'La empresa no tiene una suscripción activa. Por favor, active su plan.'
    };
  }

  // Estados válidos para acceder al sistema
  const validStatuses = ['active', 'trial'];
  
  if (validStatuses.includes(subscription.status)) {
    // Verificar si el trial ha expirado
    if (subscription.status === 'trial' && subscription.trialEnd) {
      const trialEnd = new Date(subscription.trialEnd);
      if (trialEnd < new Date()) {
        return {
          isValid: false,
          status: 'trial_expired',
          code: 'TRIAL_EXPIRED',
          message: 'Su período de prueba ha expirado. Por favor, active su plan para continuar.'
        };
      }
    }
    
    return {
      isValid: true,
      status: subscription.status,
      code: 'SUBSCRIPTION_VALID',
      message: 'Suscripción válida'
    };
  }

  // Mensajes específicos por estado
  const statusMessages: Record<string, { code: string; message: string }> = {
    'past_due': {
      code: 'PAYMENT_OVERDUE',
      message: 'Su pago está vencido. Por favor, actualice su método de pago.'
    },
    'cancelled': {
      code: 'SUBSCRIPTION_CANCELLED',
      message: 'Su suscripción ha sido cancelada. Contacte soporte para reactivarla.'
    },
    'suspended': {
      code: 'SUBSCRIPTION_SUSPENDED',
      message: 'Su suscripción está suspendida. Contacte soporte para más información.'
    }
  };

  const statusInfo = statusMessages[subscription.status] || {
    code: 'SUBSCRIPTION_INVALID',
    message: 'Su suscripción no está activa. Contacte soporte para más información.'
  };

  return {
    isValid: false,
    status: subscription.status,
    ...statusInfo
  };
}

/**
 * Middleware para bloquear acceso externo a APIs internas
 * Verifica headers de origen para prevenir scraping
 */
export function blockExternalApiAccess(req: Request, res: Response, next: NextFunction) {
  // Permitir peticiones desde el mismo origen
  const origin = req.get('origin');
  const referer = req.get('referer');
  const host = req.get('host');
  
  // Lista de orígenes permitidos
  const allowedOrigins = [
    'https://sst-colombia.com',
    'https://www.sst-colombia.com',
    process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
    'http://localhost:5000'
  ].filter(Boolean);

  // Si no hay origen (petición directa del servidor), permitir
  if (!origin && !referer) {
    // Verificar si la petición viene del navegador sin referer (posible curl/postman)
    const userAgent = req.get('user-agent') || '';
    const isBrowserRequest = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari');
    
    if (!isBrowserRequest && req.isAuthenticated()) {
      // Petición autenticada pero no del navegador - permitir (podría ser integración autorizada)
      return next();
    }
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: "Acceso no autorizado",
        code: "EXTERNAL_ACCESS_BLOCKED",
        message: "Las peticiones directas a la API requieren autenticación"
      });
    }
  }

  // Verificar origen permitido
  if (origin && !allowedOrigins.includes(origin)) {
    logger.warn({ origin }, "Intento de acceso desde origen no autorizado");
    return res.status(403).json({
      error: "Origen no autorizado",
      code: "ORIGIN_NOT_ALLOWED",
      message: "No tiene permiso para acceder a esta API desde este origen"
    });
  }

  next();
}

export { hashPassword, comparePasswords, stripPassword };
