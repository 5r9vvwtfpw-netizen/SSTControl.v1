import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Shield, 
  ChevronDown, 
  LogOut, 
  Settings,
  ClipboardList,
  Hammer,
  CheckSquare,
  RefreshCw,
  BookOpen,
  FileText,
  Clock,
  XCircle,
  X,
  User,
  Send,
  Building2
} from "lucide-react";
import safetyHelmetAvatar from "@assets/generated_images/safety_helmet_avatar_icon.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { roleLabels, getRolePermissions } from "@shared/permissions";
import { canAccessRoute } from "@shared/route-permissions";
import { filterMenuItemsByChapter } from "@shared/chapter-modules";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ProviderAccessDialog } from "@/components/ProviderAccessDialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { findBestMatch, type Message } from "@/components/ChatbotAsistente";
import { NotificationBell } from "@/components/NotificationBell";

type PHVASection = "configuracion" | "planear" | "hacer" | "verificar" | "actuar";

interface MenuItem {
  label: string;
  path: string;
  hidden?: boolean;
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

const phvaMenus: Record<PHVASection, MenuGroup[]> = {
  configuracion: [
    {
      items: [
        { label: "Panel de Control", path: "/", hidden: true },
        { label: "Empresas", path: "/empresas" },
        { label: "Usuarios", path: "/usuarios" },
        { label: "Portal de Empleados", path: "/portal-empleados" },
      ],
    },
    {
      title: "Administración Proveedor",
      items: [
        { label: "Panel de Facturación", path: "/dashboard-facturacion" },
        { label: "Mi Cuenta", path: "/mi-cuenta" },
        { label: "Tickets de Soporte", path: "/tickets-soporte" },
        { label: "Gestión de Tickets (Admin)", path: "/admin-tickets" },
        { label: "Usuarios de Soporte", path: "/admin-usuarios-soporte" },
        { label: "Profesionales Licenciados", path: "/profesionales-licenciados" },
        { label: "Directorio Profesionales SST", path: "/directorio-profesionales" },
        { label: "Documentos Legales", path: "/documentos-legales" },
      ],
    },
    {
      title: "Comunicación Interna",
      items: [
        { label: "Mensajes Internos", path: "/mensajes-internos" },
        { label: "Notificaciones", path: "/configuracion-notificaciones" },
      ],
    },
  ],
  planear: [
    {
      title: "Personal",
      items: [
        { label: "Trabajadores", path: "/trabajadores" },
        { label: "Perfiles de Cargo", path: "/perfiles-cargo" },
        { label: "Afiliaciones SSSS", path: "/afiliaciones-ssss" },
      ],
    },
    {
      title: "Gestión Integral",
      items: [
        { label: "Evaluación Inicial", path: "/evaluaciones-sst" },
      ],
    },
  ],
  hacer: [
    {
      title: "Paneles Ejecutivos",
      items: [
        { label: "Panel HACER - Controles", path: "/dashboard-hacer" },
      ],
    },
  ],
  verificar: [
    {
      title: "Paneles Ejecutivos",
      items: [
        { label: "Panel VERIFICAR - Indicadores", path: "/dashboard-verificar" },
      ],
    },
    {
      title: "Estándar 7.1.1 - Mejora Continua",
      items: [
        { label: "Acciones Correctivas", path: "/acciones-correctivas" },
        { label: "No Conformidades", path: "/no-conformidades" },
        { label: "Oportunidades de Mejora", path: "/mejora-continua" },
      ],
    },
    {
      title: "Estándar 7.1.2 - Revisión Alta Dirección",
      items: [
        { label: "Acciones Mejora Dirección", path: "/acciones-mejora-direccion" },
      ],
    },
  ],
  actuar: [
    {
      title: "Paneles Ejecutivos",
      items: [
        { label: "Panel ACTUAR - Eficacia", path: "/dashboard-actuar" },
      ],
    },
  ],
};

const phvaTabs: { key: PHVASection; label: string; icon?: typeof Settings }[] = [
  { key: "configuracion", label: "Administración Global" },
  { key: "planear", label: "Planear", icon: ClipboardList },
  { key: "hacer", label: "Hacer", icon: Hammer },
  { key: "verificar", label: "Verificar", icon: CheckSquare },
  { key: "actuar", label: "Actuar", icon: RefreshCw },
];

export function PHVANavigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<PHVASection | null>(null);
  const [selectKey, setSelectKey] = useState(0);
  const { 
    canSelectCompany, 
    companies, 
    selectedCompanyId, 
    setSelectedCompanyId, 
    selectedCompany,
    isLoading: companiesLoading,
    startAccessSession,
    endAccessSession,
    currentAccessSession,
    pendingCompanySelection,
    setPendingCompanySelection,
    companyChapter,
  } = useCompanyContext();

  // Estado del chatbot
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Función para formatear texto con markdown simple a JSX
  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Formatear **negrita**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formattedLine = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${lineIndex}-${partIndex}`} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
      });
      
      // Detectar si es un item de lista
      const isListItem = /^[-•✅❌]\s/.test(line.trim()) || /^\d+\.\s/.test(line.trim());
      
      if (line.trim() === '') {
        return <br key={lineIndex} />;
      }
      
      return (
        <p key={lineIndex} className={cn("leading-relaxed", isListItem && "pl-2")}>
          {formattedLine}
        </p>
      );
    });
  };

  useEffect(() => {
    if (chatbotOpen && chatMessages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        content: "¡Hola! Soy el asistente virtual de SST Colombia. Estoy aquí para ayudarte a usar el sistema.\n\nEscribe tu pregunta sobre cualquier tema: trabajadores, capacitaciones, accidentes, inspecciones, normativa, IPERC, y más.",
        isBot: true,
        timestamp: new Date(),
      };
      setChatMessages([welcomeMessage]);
    }
  }, [chatbotOpen, chatMessages.length]);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  // Scroll al final cuando se abre el chatbot (para volver a la conversación)
  useEffect(() => {
    if (chatbotOpen) {
      // Pequeño delay para asegurar que el contenedor esté renderizado
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 100);
    }
  }, [chatbotOpen]);

  const handleChatSend = (text?: string) => {
    const messageText = text || chatInput.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageText,
      isBot: false,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      const match = findBestMatch(messageText);
      
      let botResponse: Message;
      
      if (match) {
        botResponse = {
          id: `bot-${Date.now()}`,
          content: match.answer,
          isBot: true,
          timestamp: new Date(),
          images: match.images,
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          content: "No encontré una respuesta exacta a tu pregunta. Intenta reformular tu pregunta usando palabras clave más específicas.\n\nPuedes preguntarme sobre: trabajadores, capacitaciones, accidentes, inspecciones, IPERC, COPASST, normativa, EPP, y más.",
          isBot: true,
          timestamp: new Date(),
        };
      }

      setChatMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 600);
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const handleCompanySelect = (value: string) => {
    if (!value || value === selectedCompanyId) return;
    setSelectKey(prev => prev + 1);
    setSelectedCompanyId(value);
  };

  const handleAccessConfirm = async (reason: string, description: string, ticketNumber?: string) => {
    if (!pendingCompanySelection) return;
    await startAccessSession(pendingCompanySelection.id, reason, description, ticketNumber);
    setPendingCompanySelection(null);
  };

  const handleAccessCancel = () => {
    setPendingCompanySelection(null);
    setSelectKey(prev => prev + 1);
  };

  // Obtener permisos del usuario actual
  const userPermissions = useMemo(() => {
    if (!user?.role) return [];
    return getRolePermissions(user.role);
  }, [user?.role]);

  // Filtrar menús según permisos del usuario Y capítulo de la empresa (Resolución 0312/2019)
  const filteredPhvaMenus = useMemo(() => {
    const filtered: Record<PHVASection, MenuGroup[]> = {
      configuracion: [],
      planear: [],
      hacer: [],
      verificar: [],
      actuar: [],
    };

    for (const [section, groups] of Object.entries(phvaMenus)) {
      const filteredGroups: MenuGroup[] = [];
      
      for (const group of groups) {
        // Primero filtrar por permisos de usuario
        let filteredItems = group.items.filter(item => 
          canAccessRoute(userPermissions, item.path)
        );
        
        // Luego filtrar por capítulo de la empresa (si está definido)
        // Nota: superadmin sin empresa seleccionada ve todo (companyChapter = null)
        filteredItems = filterMenuItemsByChapter(filteredItems, companyChapter);
        
        // Solo incluir el grupo si tiene items visibles
        if (filteredItems.length > 0) {
          filteredGroups.push({
            ...group,
            items: filteredItems,
          });
        }
      }
      
      filtered[section as PHVASection] = filteredGroups;
    }

    return filtered;
  }, [userPermissions, companyChapter]);

  // Filtrar tabs PHVA (no mostrar tabs sin items)
  const visiblePhvaTabs = useMemo(() => {
    return phvaTabs.filter(tab => 
      filteredPhvaMenus[tab.key].length > 0
    );
  }, [filteredPhvaMenus]);

  const getActiveSection = (): PHVASection => {
    for (const [section, groups] of Object.entries(filteredPhvaMenus)) {
      for (const group of groups) {
        if (group.items.some(item => location === item.path || location.startsWith(item.path + "/"))) {
          return section as PHVASection;
        }
      }
    }
    return "configuracion";
  };

  const activeSection = getActiveSection();

  const currentDate = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="sticky top-0 z-50 phva-navigation-header">
      {/* Header principal con degradado verde */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SG-SST</h1>
                <p className="text-xs opacity-90">Sistema de Gestión</p>
              </div>
            </div>

            {/* Navegación PHVA - Tabs horizontales (filtrados por permisos) */}
            <nav className="flex items-center gap-2">
              {visiblePhvaTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <DropdownMenu
                    key={tab.key}
                    open={openDropdown === tab.key}
                    onOpenChange={(open) => setOpenDropdown(open ? tab.key : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={activeSection === tab.key ? "secondary" : "ghost"}
                        size="default"
                        className={activeSection === tab.key ? "font-semibold text-primary" : "text-white"}
                        data-testid={`tab-${tab.key}`}
                      >
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        {tab.label}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[240px]" data-testid={`menu-${tab.key}`}>
                      {filteredPhvaMenus[tab.key].map((group, groupIdx) => (
                        <div key={groupIdx}>
                          {group.title && (
                            <DropdownMenuLabel className="text-base font-black text-foreground">{group.title}</DropdownMenuLabel>
                          )}
                          {group.items.filter(item => !item.hidden).map((item) => (
                            <DropdownMenuItem key={item.path} asChild>
                              <Link 
                                href={item.path}
                                data-testid={`link${item.path.replace(/\//g, "-")}`}
                                className={`w-full cursor-pointer ${
                                  location === item.path || location.startsWith(item.path + "/")
                                    ? "font-semibold text-primary" 
                                    : ""
                                }`}
                              >
                                {item.label}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          {groupIdx < filteredPhvaMenus[tab.key].length - 1 && <DropdownMenuSeparator />}
                        </div>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
            </nav>

            {/* Usuario y controles */}
            <div className="flex items-center gap-4">
              {/* Campana de notificaciones de mensajes internos */}
              <NotificationBell />
              
              
              <div className="text-right text-xs hidden lg:block">
                <p className="font-medium">{user?.username}</p>
                <p className="opacity-80 text-[10px]">{roleLabels[user?.role || "trabajador"]}</p>
              </div>
              
              {/* Botón de Centro de Ayuda - Abre Chatbot con Avatar */}
              <button
                onClick={() => setChatbotOpen(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-all rounded-full px-4 py-1.5 border-2 border-white/40 hover:border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                data-testid="button-help"
              >
                <img 
                  src={safetyHelmetAvatar} 
                  alt="Asistente SST" 
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                />
                <span className="text-white font-semibold text-sm">Ayuda</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="text-white"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de información - Fecha */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-6 py-2">
          <p className="text-xs text-muted-foreground capitalize" data-testid="text-welcome-info">
            <span className="font-medium">Bienvenido:</span> {user?.username} • {currentDate}
          </p>
        </div>
      </div>

      {/* Diálogo de acceso del proveedor */}
      <ProviderAccessDialog
        open={!!pendingCompanySelection}
        company={pendingCompanySelection}
        onConfirm={handleAccessConfirm}
        onCancel={handleAccessCancel}
      />

      {/* Panel flotante del Chatbot Asistente - No bloquea la pantalla */}
      {chatbotOpen && (
        <div className="fixed bottom-4 right-4 w-[380px] h-[500px] bg-background border rounded-lg shadow-2xl flex flex-col z-50" data-testid="chatbot-panel">
          {/* Header */}
          <div className="p-3 border-b bg-primary text-primary-foreground rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={safetyHelmetAvatar} 
                alt="Asistente SST" 
                className="h-10 w-10 rounded-full object-cover border-2 border-white/30"
              />
              <div>
                <h3 className="text-sm font-semibold">Asistente SST</h3>
                <p className="text-[10px] opacity-80">Centro de Ayuda</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              onClick={() => setChatbotOpen(false)}
              data-testid="button-close-chatbot"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mensajes */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    !message.isBot && "justify-end"
                  )}
                >
                  {message.isBot && (
                    <img 
                      src={safetyHelmetAvatar} 
                      alt="Asistente" 
                      className="h-7 w-7 rounded-full object-cover flex-shrink-0 border border-primary/20"
                    />
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg p-2.5",
                      message.isBot
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <div className="text-xs space-y-1">
                      {formatMessage(message.content)}
                    </div>
                    
                    {/* Imágenes adjuntas al mensaje */}
                    {message.images && message.images.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.images.map((imageUrl, idx) => (
                          <a
                            key={idx}
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={imageUrl}
                              alt={`Imagen ${idx + 1}`}
                              className="rounded-md max-w-full h-auto border border-border cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ maxHeight: '200px' }}
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    
                  </div>
                  {!message.isBot && (
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2">
                  <img 
                    src={safetyHelmetAvatar} 
                    alt="Escribiendo..." 
                    className="h-7 w-7 rounded-full object-cover flex-shrink-0 border border-primary/20"
                  />
                  <div className="bg-muted rounded-lg p-2.5">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Campo de entrada */}
          <div className="border-t bg-background p-2 flex gap-2 rounded-b-lg">
            <Input
              ref={chatInputRef}
              placeholder="Escribe tu pregunta..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
              className="flex-1 h-9 text-sm"
              data-testid="input-chatbot-message"
            />
            <Button 
              onClick={() => handleChatSend()} 
              size="icon"
              className="h-9 w-9"
              disabled={!chatInput.trim() || isTyping}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
