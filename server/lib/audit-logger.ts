/**
 * Audit Logger - Legal Compliance System
 * Bloque 2: Infrastructure
 * 
 * Records all CRUD operations on regulated entities to comply with:
 * - Ley 1581/2012 (Habeas Data - Personal Data Protection)
 * - Decreto 1074/2015 (SST Records - 20 year retention)
 * - Resolución 2346/2007 (Occupational Health Records)
 */

import { db } from '../db';
import * as schema from '@shared/schema';
import logger from './logger';

export interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface AuditLogParams {
  companyId: string;
  userId: string;
  userRole: string;
  username: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'access_report';
  oldValues?: any;
  newValues?: any;
  dataSubjectId?: string;
  dataSubjectName?: string;
  description?: string;
  context?: AuditContext;
}

/**
 * Log an audit event to the database
 * 
 * @param params - Audit log parameters
 * @returns Promise<void>
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    // Calculate changed fields for update operations
    let changedFields: string[] | undefined;
    if (params.action === 'update' && params.oldValues && params.newValues) {
      changedFields = Object.keys(params.newValues).filter(
        key => JSON.stringify(params.oldValues![key]) !== JSON.stringify(params.newValues![key])
      );
    }

    // Insert audit log
    await db.insert(schema.auditLogs).values({
      companyId: params.companyId,
      userId: params.userId,
      userRole: params.userRole,
      username: params.username,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      dataSubjectId: params.dataSubjectId,
      dataSubjectName: params.dataSubjectName,
      oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
      newValues: params.newValues ? JSON.stringify(params.newValues) : null,
      changedFields: changedFields && changedFields.length > 0 
        ? JSON.stringify(changedFields) 
        : null,
      ipAddress: params.context?.ipAddress,
      userAgent: params.context?.userAgent,
      requestId: params.context?.requestId,
      description: params.description || `${params.action} ${params.entityType} ${params.entityId}`,
      source: 'api',
    });

    logger.debug({
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      userId: params.userId,
    }, 'Audit event logged');

  } catch (error: any) {
    // Log error but don't throw - audit logging should not break business logic
    logger.error({
      err: error,
      entityType: params.entityType,
      action: params.action,
    }, 'Failed to log audit event');
  }
}

/**
 * Helper to extract audit context from Express request
 */
export function getAuditContext(req: any): AuditContext {
  return {
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
    requestId: req.requestId,
  };
}
