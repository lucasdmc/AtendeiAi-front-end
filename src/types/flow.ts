// Tipos para o Editor de Fluxo de Chatbot
import { Node, Edge } from '@xyflow/react';

export type NodeType =
  | 'start-channel'
  | 'start-manual'
  | 'condition-weekday'
  | 'condition-hours'
  | 'condition-simple'
  | 'condition-multi'
  | 'action-message'
  | 'action-note'
  | 'action-transfer-sector'
  | 'action-edit-tags'
  | 'action-transfer-agent'
  | 'action-transfer-ai'
  | 'action-private'
  | 'action-choose'
  | 'action-input'
  | 'action-template'
  | 'action-trigger-flow'
  | 'action-status-waiting'
  | 'action-rating'
  | 'action-feedback'
  | 'action-contact-field'
  | 'action-wait'
  | 'ask-question'
  | 'ask-name'
  | 'ask-email'
  | 'ask-number'
  | 'ask-phone'
  | 'ask-date'
  | 'ask-file'
  | 'ask-address'
  | 'end-conversation'
  | 'util-notes'
  | 'integration-webhook';

export type NodeCategory = 'start' | 'condition' | 'action' | 'ask' | 'end' | 'util' | 'integration';

export interface BlockDefinition {
  type: NodeType;
  category: NodeCategory;
  icon: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  outputs: number | 'multiple';
  hasInput: boolean;
}

export interface FlowNode extends Node {
  type: NodeType;
  data: {
    label: string;
    description?: string;
    config?: Record<string, any>;
    error?: boolean;
  };
}

export interface FlowEdge extends Edge {
  label?: string;
}

export interface FlowDTO {
  id?: string;
  name: string;
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    sourceHandle?: string;
    target: string;
    targetHandle?: string;
    label?: string;
  }>;
  viewport: { x: number; y: number; zoom: number };
  createdAt?: string;
  updatedAt: string;
}

export interface TemplateFlow {
  id: string;
  title: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

