import { memo, useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';

import 'reactflow/dist/style.css';

const DISC_PX = 80;

const SkillFlowNode = memo(({ data }) => (
  <div className={`agent-skill-flow-node ${data.statusClass ?? ''}`}>
    <Handle
      type="target"
      position={Position.Top}
      className="agent-skill-flow-handle"
    />
    <div
      className="agent-skill-flow-node__disc"
      style={{ width: DISC_PX, height: DISC_PX }}
    >
      <span className="agent-skill-flow-node__step">
        {data.step}/{data.max}
      </span>
    </div>
    <div className="agent-skill-flow-node__name" title={data.label}>
      {data.label.length > 8 ? `${data.label.slice(0, 7)}…` : data.label}
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      className="agent-skill-flow-handle"
    />
  </div>
));

SkillFlowNode.displayName = 'SkillFlowNode';

const nodeTypes = { skill: SkillFlowNode };

function FlowCanvas({ nodes: nodesIn, edges: edgesIn }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(nodesIn);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesIn);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(nodesIn);
    setEdges(edgesIn);
  }, [nodesIn, edgesIn, setNodes, setEdges]);

  const structureKey = useMemo(
    () =>
      `${nodesIn
        .map((n) => n.id)
        .sort()
        .join(',')}|${edgesIn.length}`,
    [nodesIn, edgesIn]
  );

  const onInit = useCallback(() => {
    requestAnimationFrame(() => {
      fitView({ padding: 0.06, duration: 220 });
    });
  }, [fitView]);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      fitView({ padding: 0.06, duration: 200 });
    });
    return () => cancelAnimationFrame(t);
  }, [structureKey, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onInit={onInit}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnScroll
      zoomOnPinch
      minZoom={0.25}
      maxZoom={2.25}
      defaultEdgeOptions={{
        type: 'smoothstep',
      }}
    >
      <Background
        variant="dots"
        color="#a5b4fc"
        gap={22}
        size={1.15}
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

const DEFAULT_FLOW_H = 'min(74vh, 840px)';

/**
 * @param {{ nodes: import('reactflow').Node[], edges: import('reactflow').Edge[], flowHeight?: number | string }} props
 */
export default function AgentSkillFlowView({ nodes, edges, flowHeight = DEFAULT_FLOW_H }) {
  const h = typeof flowHeight === 'number' ? `${flowHeight}px` : flowHeight;
  return (
    <div
      className="agent-skill-flow-root"
      style={{
        width: '100%',
        height: h,
        minHeight: h,
      }}
    >
      <ReactFlowProvider>
        <FlowCanvas nodes={nodes} edges={edges} />
      </ReactFlowProvider>
    </div>
  );
}
