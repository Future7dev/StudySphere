import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TopicFlowNode from './TopicFlowNode';
import SubtopicFlowNode from './SubtopicFlowNode';
import SubSubtopicFlowNode from './SubSubtopicFlowNode';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  FolderTree,
  Columns,
  Rows,
  Filter,
  CheckCircle2,
  Loader,
  Eye,
  EyeOff,
  MoveHorizontal,
  MoveVertical
} from 'lucide-react';
import './RoadmapFlow.css';

const nodeTypes = {
  topicNode: TopicFlowNode,
  subtopicNode: SubtopicFlowNode,
  subSubtopicNode: SubSubtopicFlowNode,
};

/**
 * Builds hierarchical branching nodes and edges for both Vertical and Horizontal layouts
 */
function buildBranchingGraph({
  roadmapNodes = [],
  orientation = 'vertical', // 'vertical' | 'horizontal'
  expandedTopics = {},
  expandedSubtopics = {},
  activeFilter = 'all',
  onToggleTopicExpand,
  onToggleSubtopicExpand,
  onSelectNode,
  onOpenTopic,
}) {
  const nodes = [];
  const edges = [];

  const isHorizontal = orientation === 'horizontal';

  // Sizing constants
  const TOPIC_WIDTH = 310;
  const TOPIC_MIN_HEIGHT = 190;
  const SUB_WIDTH = 280;
  const SUB_HEIGHT = 70;
  const LEAF_WIDTH = 250;
  const LEAF_HEIGHT = 44;

  if (isHorizontal) {
    /* ──────────────────────────────────────────────────────────────────────────
       HORIZONTAL PIPELINE (Milestones Left-to-Right, Branches Downward)
    ────────────────────────────────────────────────────────────────────────── */
    const TOPIC_Y = 50;
    const SUB_Y = 310;
    const GAP_BETWEEN_TOPICS = 100;
    const SUB_COL_WIDTH = 300;

    let currentX = 60;

    roadmapNodes.forEach((topic, topicIdx) => {
      const isTopicVisible =
        activeFilter === 'all' ||
        (activeFilter === 'completed' && topic.status === 'completed') ||
        (activeFilter === 'in-progress' && topic.status === 'in-progress') ||
        (activeFilter === 'not-started' && topic.status === 'not-started');

      const isTopicExpanded = expandedTopics[topic.id] !== false;
      const subtopics = topic.subtopics || [];

      // Calculate width for this topic block
      let topicBlockWidth = TOPIC_WIDTH;
      if (isTopicExpanded && subtopics.length > 0) {
        topicBlockWidth = Math.max(TOPIC_WIDTH, subtopics.length * SUB_COL_WIDTH);
      }

      // Center the milestone node above its subtopic columns
      const topicX = currentX + (topicBlockWidth - TOPIC_WIDTH) / 2;
      const completedSubs = subtopics.filter((s) => s.status === 'completed').length;
      const totalSubs = subtopics.length;
      const pct = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

      // 1. Level 1: Milestone Topic Node
      nodes.push({
        id: topic.id,
        type: 'topicNode',
        position: { x: topicX, y: TOPIC_Y },
        data: {
          id: topic.id,
          index: topicIdx,
          title: topic.title,
          status: topic.status,
          subtopics,
          completedCount: completedSubs,
          totalSubs,
          pct,
          isExpanded: isTopicExpanded,
          onToggleExpand: onToggleTopicExpand,
          onSelect: onSelectNode,
          onOpenTopic,
        },
        style: {
          opacity: isTopicVisible ? 1 : 0.2,
          transition: 'opacity 0.25s ease',
        },
      });

      // Milestone Spine Edge (Left to Right)
      if (topicIdx > 0) {
        const prevTopic = roadmapNodes[topicIdx - 1];
        const isTargetActive = topic.status === 'in-progress';
        let spineColor = '#2A2A48';
        let spineDash = '6,6';
        let isAnimated = false;

        if (topic.status === 'completed') {
          spineColor = '#34D399';
          spineDash = undefined;
        } else if (isTargetActive) {
          spineColor = '#5B5FED';
          spineDash = undefined;
          isAnimated = true;
        }

        edges.push({
          id: `spine-${prevTopic.id}-${topic.id}`,
          source: prevTopic.id,
          target: topic.id,
          sourceHandle: 'right-branches',
          targetHandle: 'left',
          type: 'smoothstep',
          animated: isAnimated,
          style: {
            stroke: spineColor,
            strokeWidth: isTargetActive ? 3.5 : 2.5,
            strokeDasharray: spineDash,
            filter: isTargetActive ? 'drop-shadow(0 0 8px rgba(91,95,237,0.7))' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: spineColor,
          },
        });
      }

      // 2. Level 2 & 3 Branches: Subtopics & Concepts positioned downwards
      if (isTopicExpanded && subtopics.length > 0) {
        subtopics.forEach((sub, subIdx) => {
          const subX = currentX + subIdx * SUB_COL_WIDTH + 10;
          const isSubExpanded = expandedSubtopics[sub.id] !== false;
          const items = sub.items || [];
          const isSubVisible = isTopicVisible;

          nodes.push({
            id: sub.id,
            type: 'subtopicNode',
            position: { x: subX, y: SUB_Y },
            data: {
              id: sub.id,
              title: sub.title,
              status: sub.status,
              parentTopicId: topic.id,
              items,
              isExpanded: isSubExpanded,
              onToggleExpand: onToggleSubtopicExpand,
              onSelect: () => onSelectNode(topic),
              onOpenTopic,
            },
            style: {
              opacity: isSubVisible ? 1 : 0.2,
              transition: 'opacity 0.25s ease',
            },
          });

          // Edge: Topic -> Subtopic Branch (from bottom to top)
          let branchColor = '#2A2A48';
          if (sub.status === 'completed') branchColor = 'rgba(52, 211, 153, 0.7)';
          else if (sub.status === 'in-progress') branchColor = 'rgba(91, 95, 237, 0.85)';

          edges.push({
            id: `branch-${topic.id}-${sub.id}`,
            source: topic.id,
            target: sub.id,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'default',
            style: {
              stroke: branchColor,
              strokeWidth: sub.status === 'in-progress' ? 2.5 : 1.75,
              strokeDasharray: sub.status === 'not-started' ? '4,4' : undefined,
            },
          });

          // Level 3 Concept Leaves: stacked below Subtopic
          if (isSubExpanded && items.length > 0) {
            items.forEach((item, itemIdx) => {
              const leafY = SUB_Y + SUB_HEIGHT + 20 + itemIdx * (LEAF_HEIGHT + 8);
              const leafX = subX + 15;

              nodes.push({
                id: item.id,
                type: 'subSubtopicNode',
                position: { x: leafX, y: leafY },
                data: {
                  id: item.id,
                  title: item.title,
                  status: item.status,
                  parentSubtopicId: sub.id,
                  parentTopicId: topic.id,
                  onOpenTopic,
                },
                style: {
                  opacity: isSubVisible ? 1 : 0.2,
                  transition: 'opacity 0.25s ease',
                },
              });

              // Edge: Subtopic -> Concept Leaf
              let leafEdgeColor = '#1E1E3A';
              if (item.status === 'completed') leafEdgeColor = 'rgba(52, 211, 153, 0.5)';
              else if (item.status === 'in-progress') leafEdgeColor = 'rgba(91, 95, 237, 0.65)';

              edges.push({
                id: `leaf-edge-${sub.id}-${item.id}`,
                source: sub.id,
                target: item.id,
                sourceHandle: 'bottom',
                targetHandle: 'top',
                type: 'default',
                style: {
                  stroke: leafEdgeColor,
                  strokeWidth: 1.5,
                  strokeDasharray: item.status === 'not-started' ? '3,3' : undefined,
                },
              });
            });
          }
        });
      }

      currentX += topicBlockWidth + GAP_BETWEEN_TOPICS;
    });

  } else {
    /* ──────────────────────────────────────────────────────────────────────────
       VERTICAL TREE (Milestones Top-to-Bottom, Branches Rightward)
    ────────────────────────────────────────────────────────────────────────── */
    const MILESTONE_X = 60;
    const SUBTOPIC_X = 460;
    const LEAF_X = 810;
    const GAP_BETWEEN_TOPICS = 70;

    let currentY = 50;

    roadmapNodes.forEach((topic, topicIdx) => {
      const isTopicVisible =
        activeFilter === 'all' ||
        (activeFilter === 'completed' && topic.status === 'completed') ||
        (activeFilter === 'in-progress' && topic.status === 'in-progress') ||
        (activeFilter === 'not-started' && topic.status === 'not-started');

      const isTopicExpanded = expandedTopics[topic.id] !== false;
      const subtopics = topic.subtopics || [];

      // Calculate height needed for this topic's branches
      let topicBlockHeight = TOPIC_MIN_HEIGHT;

      if (isTopicExpanded && subtopics.length > 0) {
        let totalSubtopicsHeight = 0;
        subtopics.forEach((sub) => {
          const isSubExpanded = expandedSubtopics[sub.id] !== false;
          const items = sub.items || [];
          const subHeight = isSubExpanded && items.length > 0
            ? Math.max(SUB_HEIGHT, items.length * LEAF_HEIGHT + 16)
            : SUB_HEIGHT;
          totalSubtopicsHeight += subHeight + 16;
        });
        topicBlockHeight = Math.max(TOPIC_MIN_HEIGHT, totalSubtopicsHeight);
      }

      const topicY = currentY;
      const completedSubs = subtopics.filter((s) => s.status === 'completed').length;
      const totalSubs = subtopics.length;
      const pct = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

      // 1. Level 1: Milestone Topic Node
      nodes.push({
        id: topic.id,
        type: 'topicNode',
        position: { x: MILESTONE_X, y: topicY },
        data: {
          id: topic.id,
          index: topicIdx,
          title: topic.title,
          status: topic.status,
          subtopics,
          completedCount: completedSubs,
          totalSubs,
          pct,
          isExpanded: isTopicExpanded,
          onToggleExpand: onToggleTopicExpand,
          onSelect: onSelectNode,
          onOpenTopic,
        },
        style: {
          opacity: isTopicVisible ? 1 : 0.2,
          transition: 'opacity 0.25s ease',
        },
      });

      // Milestone Spine Edge (Top to Bottom)
      if (topicIdx > 0) {
        const prevTopic = roadmapNodes[topicIdx - 1];
        const isTargetActive = topic.status === 'in-progress';
        let spineColor = '#2A2A48';
        let spineDash = '6,6';
        let isAnimated = false;

        if (topic.status === 'completed') {
          spineColor = '#34D399';
          spineDash = undefined;
        } else if (isTargetActive) {
          spineColor = '#5B5FED';
          spineDash = undefined;
          isAnimated = true;
        }

        edges.push({
          id: `spine-${prevTopic.id}-${topic.id}`,
          source: prevTopic.id,
          target: topic.id,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'smoothstep',
          animated: isAnimated,
          style: {
            stroke: spineColor,
            strokeWidth: isTargetActive ? 3.5 : 2.5,
            strokeDasharray: spineDash,
            filter: isTargetActive ? 'drop-shadow(0 0 8px rgba(91,95,237,0.7))' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: spineColor,
          },
        });
      }

      // 2. Level 2 & 3 Branches: Subtopics & Concepts positioned rightward
      if (isTopicExpanded && subtopics.length > 0) {
        let subY = topicY;

        subtopics.forEach((sub) => {
          const isSubExpanded = expandedSubtopics[sub.id] !== false;
          const items = sub.items || [];
          const isSubVisible = isTopicVisible;

          nodes.push({
            id: sub.id,
            type: 'subtopicNode',
            position: { x: SUBTOPIC_X, y: subY },
            data: {
              id: sub.id,
              title: sub.title,
              status: sub.status,
              parentTopicId: topic.id,
              items,
              isExpanded: isSubExpanded,
              onToggleExpand: onToggleSubtopicExpand,
              onSelect: () => onSelectNode(topic),
              onOpenTopic,
            },
            style: {
              opacity: isSubVisible ? 1 : 0.2,
              transition: 'opacity 0.25s ease',
            },
          });

          // Edge: Topic -> Subtopic Branch
          let branchColor = '#2A2A48';
          if (sub.status === 'completed') branchColor = 'rgba(52, 211, 153, 0.7)';
          else if (sub.status === 'in-progress') branchColor = 'rgba(91, 95, 237, 0.85)';

          edges.push({
            id: `branch-${topic.id}-${sub.id}`,
            source: topic.id,
            target: sub.id,
            sourceHandle: 'right-branches',
            targetHandle: 'left',
            type: 'default',
            style: {
              stroke: branchColor,
              strokeWidth: sub.status === 'in-progress' ? 2.5 : 1.75,
              strokeDasharray: sub.status === 'not-started' ? '4,4' : undefined,
            },
          });

          // Level 3 Concept Leaves
          if (isSubExpanded && items.length > 0) {
            items.forEach((item, itemIdx) => {
              const leafY = subY + itemIdx * LEAF_HEIGHT;

              nodes.push({
                id: item.id,
                type: 'subSubtopicNode',
                position: { x: LEAF_X, y: leafY },
                data: {
                  id: item.id,
                  title: item.title,
                  status: item.status,
                  parentSubtopicId: sub.id,
                  parentTopicId: topic.id,
                  onOpenTopic,
                },
                style: {
                  opacity: isSubVisible ? 1 : 0.2,
                  transition: 'opacity 0.25s ease',
                },
              });

              // Edge: Subtopic -> Concept Leaf
              let leafEdgeColor = '#1E1E3A';
              if (item.status === 'completed') leafEdgeColor = 'rgba(52, 211, 153, 0.5)';
              else if (item.status === 'in-progress') leafEdgeColor = 'rgba(91, 95, 237, 0.65)';

              edges.push({
                id: `leaf-edge-${sub.id}-${item.id}`,
                source: sub.id,
                target: item.id,
                sourceHandle: 'right',
                targetHandle: 'left',
                type: 'default',
                style: {
                  stroke: leafEdgeColor,
                  strokeWidth: 1.5,
                  strokeDasharray: item.status === 'not-started' ? '3,3' : undefined,
                },
              });
            });

            subY += Math.max(SUB_HEIGHT, items.length * LEAF_HEIGHT) + 16;
          } else {
            subY += SUB_HEIGHT + 16;
          }
        });
      }

      currentY += topicBlockHeight + GAP_BETWEEN_TOPICS;
    });
  }

  return { nodes, edges };
}

function FlowCanvas({ roadmap, selectedNode, onSelectNode }) {
  const navigate = useNavigate();
  const [orientation, setOrientation] = useState('vertical'); // 'vertical' | 'horizontal'
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Expand / Collapse state maps for Topic and Subtopics
  const [expandedTopics, setExpandedTopics] = useState(() => {
    const map = {};
    (roadmap.nodes || []).forEach((n) => {
      map[n.id] = true;
    });
    return map;
  });

  const [expandedSubtopics, setExpandedSubtopics] = useState(() => {
    const map = {};
    (roadmap.nodes || []).forEach((n) => {
      (n.subtopics || []).forEach((s) => {
        map[s.id] = true;
      });
    });
    return map;
  });

  const { fitView } = useReactFlow();

  const handleOpenTopic = useCallback((topicId) => {
    navigate(`/topic/${topicId}`);
  }, [navigate]);

  const handleToggleTopicExpand = useCallback((topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: prev[topicId] === false ? true : false,
    }));
  }, []);

  const handleToggleSubtopicExpand = useCallback((subId) => {
    setExpandedSubtopics((prev) => ({
      ...prev,
      [subId]: prev[subId] === false ? true : false,
    }));
  }, []);

  // Bulk expand/collapse helpers
  const handleExpandAll = () => {
    const tMap = {};
    const sMap = {};
    (roadmap.nodes || []).forEach((n) => {
      tMap[n.id] = true;
      (n.subtopics || []).forEach((s) => {
        sMap[s.id] = true;
      });
    });
    setExpandedTopics(tMap);
    setExpandedSubtopics(sMap);
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  };

  const handleCollapseAll = () => {
    const tMap = {};
    (roadmap.nodes || []).forEach((n) => {
      tMap[n.id] = false;
    });
    setExpandedTopics(tMap);
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  };

  // Re-fit when orientation changes
  const handleOrientationChange = (newOrientation) => {
    setOrientation(newOrientation);
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 450 });
    }, 50);
  };

  const { nodes, edges } = useMemo(() => {
    return buildBranchingGraph({
      roadmapNodes: roadmap.nodes || [],
      orientation,
      expandedTopics,
      expandedSubtopics,
      activeFilter,
      onToggleTopicExpand: handleToggleTopicExpand,
      onToggleSubtopicExpand: handleToggleSubtopicExpand,
      onSelectNode,
      onOpenTopic: handleOpenTopic,
    });
  }, [
    roadmap.nodes,
    orientation,
    expandedTopics,
    expandedSubtopics,
    activeFilter,
    handleToggleTopicExpand,
    handleToggleSubtopicExpand,
    onSelectNode,
    handleOpenTopic,
  ]);

  const handleFitView = () => {
    fitView({ padding: 0.15, duration: 400 });
  };

  const handleNodeClick = (_, node) => {
    const originalNode = roadmap.nodes.find((n) => n.id === node.id);
    if (originalNode && onSelectNode) {
      onSelectNode(originalNode);
    }
  };

  return (
    <div className={`rf-container-card card ${isFullscreen ? 'rf-fullscreen' : ''}`}>
      {/* Top Canvas Toolbar */}
      <div className="rf-canvas-header">
        <div className="rf-canvas-left">
          <div className="rf-canvas-title-group">
            <span className="rf-live-badge">
              <FolderTree size={13} /> Multi-Branch Tree
            </span>
            <span className="rf-canvas-hint">
              {orientation === 'horizontal' ? 'Horizontal Pipeline Flow' : 'Vertical Tree Flow'} · Click node to inspect
            </span>
          </div>
        </div>

        <div className="rf-canvas-actions">
          {/* Orientation Switcher */}
          <div className="rf-layout-toggle-group">
            <button
              className={`rf-toggle-btn ${orientation === 'vertical' ? 'active' : ''}`}
              onClick={() => handleOrientationChange('vertical')}
              title="Vertical Tree Layout (Milestones Top-to-Bottom)"
            >
              <MoveVertical size={13} />
              <span>Vertical</span>
            </button>
            <button
              className={`rf-toggle-btn ${orientation === 'horizontal' ? 'active' : ''}`}
              onClick={() => handleOrientationChange('horizontal')}
              title="Horizontal Pipeline Layout (Milestones Left-to-Right)"
            >
              <MoveHorizontal size={13} />
              <span>Horizontal</span>
            </button>
          </div>

          {/* Branch Expand / Collapse Controls */}
          <div className="rf-layout-toggle-group">
            <button
              className="rf-toggle-btn"
              onClick={handleExpandAll}
              title="Expand All Subtopics & Concept Branches"
            >
              <Eye size={13} />
              <span>Expand All</span>
            </button>
            <button
              className="rf-toggle-btn"
              onClick={handleCollapseAll}
              title="Collapse to Milestone Nodes"
            >
              <EyeOff size={13} />
              <span>Milestones Only</span>
            </button>
          </div>

          {/* Filter Group */}
          <div className="rf-filter-group">
            <button
              className={`rf-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({roadmap.nodes.length})
            </button>
            <button
              className={`rf-filter-pill ${activeFilter === 'in-progress' ? 'active in-prog' : ''}`}
              onClick={() => setActiveFilter(activeFilter === 'in-progress' ? 'all' : 'in-progress')}
            >
              <Loader size={11} /> Current
            </button>
            <button
              className={`rf-filter-pill ${activeFilter === 'completed' ? 'active comp' : ''}`}
              onClick={() => setActiveFilter(activeFilter === 'completed' ? 'all' : 'completed')}
            >
              <CheckCircle2 size={11} /> Done
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            className="rf-action-icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* React Flow Viewport */}
      <div className="rf-viewport-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.12}
          maxZoom={1.6}
          defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={1.5}
            color="rgba(91, 95, 237, 0.12)"
            className="rf-bg-grid"
          />

          <Controls
            showInteractive={false}
            className="rf-controls-custom"
          />

          {showMiniMap && (
            <MiniMap
              nodeStrokeColor="#5B5FED"
              nodeColor={(n) => {
                if (n.data?.status === 'completed') return '#34D399';
                if (n.data?.status === 'in-progress') return '#5B5FED';
                return '#1E1E3A';
              }}
              nodeBorderRadius={6}
              maskColor="rgba(8, 8, 16, 0.85)"
              className="rf-minimap-custom"
            />
          )}

          {/* Bottom Floating Legend */}
          <Panel position="bottom-left" className="rf-panel-legend">
            <div className="rf-legend-item">
              <span className="rf-legend-dot completed" /> Completed
            </div>
            <div className="rf-legend-item">
              <span className="rf-legend-dot in-progress" /> Current Target
            </div>
            <div className="rf-legend-item">
              <span className="rf-legend-dot locked" /> Next Steps
            </div>
            <button
              className="rf-reset-view-btn"
              onClick={handleFitView}
              title="Reset & Center View"
            >
              <RotateCcw size={12} /> Fit Canvas
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

export default function RoadmapFlow(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
