// Conector de entrada/saída para nós do canvas
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NODE_TOKENS } from '../styles';

interface NodeConnectorProps {
  type: 'source' | 'target';
  position: Position;
  id?: string;
  connected?: boolean;
  label?: string;
  className?: string;
}

export function NodeConnector({
  type,
  position,
  id,
  connected = false,
  label,
  className,
}: NodeConnectorProps) {
  return (
    <Handle
      type={type}
      position={position}
      id={id}
      className={cn(
        'transition-colors duration-200',
        className
      )}
      style={{
        width: NODE_TOKENS.CONNECTOR_SIZE,
        height: NODE_TOKENS.CONNECTOR_SIZE,
        backgroundColor: connected ? NODE_TOKENS.CONNECTOR_BLUE : NODE_TOKENS.CONNECTOR_GRAY,
        border: 'none',
        cursor: 'crosshair',
        transform: 'none',
      }}
      aria-label={label}
    />
  );
}

