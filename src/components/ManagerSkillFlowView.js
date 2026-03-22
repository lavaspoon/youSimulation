import { memo, useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  Controls,
  Handle,
  NodeToolbar,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';

import 'reactflow/dist/style.css';

const DISC = 80;

const ManagerSkillFlowNode = memo(({ data }) => (
  <div
    className={`manager-skill-flow-node${data.selected ? ' manager-skill-flow-node--selected' : ''}`}
  >
    <Handle
      type="target"
      position={Position.Top}
      className="manager-skill-flow-handle"
    />
    <div
      className="manager-skill-flow-node__disc"
      style={{ width: DISC, height: DISC }}
    >
      <span className="manager-skill-flow-node__text">
        {data.label.length > 9 ? `${data.label.slice(0, 8)}…` : data.label}
      </span>
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      className="manager-skill-flow-handle"
    />
  </div>
));

ManagerSkillFlowNode.displayName = 'ManagerSkillFlowNode';

const nodeTypes = { managerSkill: ManagerSkillFlowNode };

function FlowCanvas({
  nodes: nodesIn,
  edges: edgesIn,
  onNodeClick,
  onPaneClick,
  onPositionCommit,
  layoutResetKey,
  selectedNodeId,
  selectedIsRoot,
  reparentSourceId,
  addingChildFor,
  newChildName,
  onNewChildNameChange,
  onToolbarReparent,
  onToolbarDelete,
  onToolbarAddChild,
  onSubmitNewChild,
  onCancelAddChild,
  onReparentToRoot,
  onCancelReparent,
}) {
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
      fitView({ padding: 0.06, duration: 200 });
    });
  }, [fitView]);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      fitView({ padding: 0.06, duration: 200 });
    });
    return () => cancelAnimationFrame(t);
  }, [structureKey, layoutResetKey, fitView]);

  const handleNodeClick = useCallback(
    (_, node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const handlePaneClick = useCallback(() => {
    onPaneClick?.();
  }, [onPaneClick]);

  const onNodeDragStop = useCallback(
    (_, node) => {
      onPositionCommit?.(node.id, node.position.x, node.position.y);
    },
    [onPositionCommit]
  );

  const showToolbar =
    Boolean(selectedNodeId) &&
    !reparentSourceId &&
    Boolean(nodesIn.some((n) => n.id === selectedNodeId));

  const showChildForm =
    addingChildFor && selectedNodeId && addingChildFor === selectedNodeId;

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onInit={onInit}
      onNodeClick={handleNodeClick}
      onPaneClick={handlePaneClick}
      onNodeDragStop={onNodeDragStop}
      nodeTypes={nodeTypes}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnScroll
      zoomOnPinch
      minZoom={0.25}
      maxZoom={2.25}
      defaultEdgeOptions={{ type: 'smoothstep' }}
    >
      {reparentSourceId ? (
        <div
          className="manager-skill-flow-reparent-banner"
          role="status"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="manager-skill-flow-reparent-banner__text">
            새 상위 노드를 클릭하세요.
          </span>
          <div className="manager-skill-flow-reparent-banner__actions">
            <button
              type="button"
              className="manager-skill-flow-banner-btn manager-skill-flow-banner-btn--primary"
              onClick={onReparentToRoot}
            >
              최상위로
            </button>
            <button
              type="button"
              className="manager-skill-flow-banner-btn"
              onClick={onCancelReparent}
            >
              취소
            </button>
          </div>
        </div>
      ) : null}

      {selectedNodeId ? (
        <NodeToolbar
          nodeId={selectedNodeId}
          isVisible={showToolbar}
          position={Position.Top}
          offset={14}
          align="center"
          className="manager-skill-node-toolbar"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {showChildForm ? (
            <div className="manager-skill-node-toolbar__child-form">
              <input
                type="text"
                className="manager-skill-node-toolbar__input"
                value={newChildName}
                onChange={(e) => onNewChildNameChange?.(e.target.value)}
                placeholder="하위 스킬 이름"
                autoComplete="off"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSubmitNewChild?.();
                  }
                  if (e.key === 'Escape') onCancelAddChild?.();
                }}
              />
              <button
                type="button"
                className="manager-skill-node-toolbar__mini manager-skill-node-toolbar__mini--go"
                onClick={onSubmitNewChild}
              >
                추가
              </button>
              <button
                type="button"
                className="manager-skill-node-toolbar__mini"
                onClick={onCancelAddChild}
              >
                닫기
              </button>
            </div>
          ) : (
            <div className="manager-skill-node-toolbar__actions">
              <button
                type="button"
                className="manager-skill-node-toolbar__btn"
                onClick={onToolbarReparent}
              >
                부모 노드 변경
              </button>
              <button
                type="button"
                className="manager-skill-node-toolbar__btn manager-skill-node-toolbar__btn--danger"
                onClick={onToolbarDelete}
              >
                노드 삭제
              </button>
              <button
                type="button"
                className="manager-skill-node-toolbar__btn manager-skill-node-toolbar__btn--accent"
                onClick={onToolbarAddChild}
              >
                {selectedIsRoot ? '하위 스킬 추가' : '자식 노드 추가'}
              </button>
            </div>
          )}
        </NodeToolbar>
      ) : null}

      <Background
        variant="dots"
        color="#c4b5fd"
        gap={22}
        size={1.15}
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

const DEFAULT_MGR_FLOW_H = 'min(74vh, 840px)';

/**
 * @param {{
 *   nodes: import('reactflow').Node[],
 *   edges: import('reactflow').Edge[],
 *   height?: number | string,
 *   selectedNodeId?: string | null,
 *   selectedIsRoot?: boolean,
 *   reparentSourceId?: string | null,
 *   addingChildFor?: string | null,
 *   newChildName?: string,
 *   onNewChildNameChange?: (v: string) => void,
 *   onNodeClick?: (id: string) => void,
 *   onPaneClick?: () => void,
 *   onPositionCommit?: (id: string, x: number, y: number) => void,
 *   onToolbarReparent?: () => void,
 *   onToolbarDelete?: () => void,
 *   onToolbarAddChild?: () => void,
 *   onSubmitNewChild?: () => void,
 *   onCancelAddChild?: () => void,
 *   onReparentToRoot?: () => void,
 *   onCancelReparent?: () => void,
 *   layoutResetKey?: number,
 * }} props
 */
export default function ManagerSkillFlowView({
  nodes,
  edges,
  height = DEFAULT_MGR_FLOW_H,
  selectedNodeId = null,
  selectedIsRoot = false,
  reparentSourceId = null,
  addingChildFor = null,
  newChildName = '',
  onNewChildNameChange,
  onNodeClick,
  onPaneClick,
  onPositionCommit,
  onToolbarReparent,
  onToolbarDelete,
  onToolbarAddChild,
  onSubmitNewChild,
  onCancelAddChild,
  onReparentToRoot,
  onCancelReparent,
  layoutResetKey = 0,
}) {
  const h = typeof height === 'number' ? `${height}px` : height;
  return (
    <div
      className="manager-skill-flow-root"
      style={{
        width: '100%',
        height: h,
        minHeight: h,
      }}
    >
      <ReactFlowProvider>
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onPositionCommit={onPositionCommit}
          layoutResetKey={layoutResetKey}
          selectedNodeId={selectedNodeId}
          selectedIsRoot={selectedIsRoot}
          reparentSourceId={reparentSourceId}
          addingChildFor={addingChildFor}
          newChildName={newChildName}
          onNewChildNameChange={onNewChildNameChange}
          onToolbarReparent={onToolbarReparent}
          onToolbarDelete={onToolbarDelete}
          onToolbarAddChild={onToolbarAddChild}
          onSubmitNewChild={onSubmitNewChild}
          onCancelAddChild={onCancelAddChild}
          onReparentToRoot={onReparentToRoot}
          onCancelReparent={onCancelReparent}
        />
      </ReactFlowProvider>
    </div>
  );
}
