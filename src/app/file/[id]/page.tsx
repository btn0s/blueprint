"use client";

import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import {
  CircleIcon,
  FrameIcon,
  PlusIcon,
  SquareIcon,
} from "@radix-ui/react-icons";
import {
  Card,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRoot,
  ContextMenuTrigger,
  Flex,
  Text,
  Theme,
} from "@radix-ui/themes";
import classNames from "classnames";
import { LiaVectorSquareSolid } from "react-icons/lia";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Edge,
  EdgeChange,
  Handle,
  Node,
  NodeChange,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";

import TitlePanel from "@/components/TitlePanel";
import { OnClickNode, ScaleNode } from "@/components/nodes/CustomNode";
import { BlueprintFile, useFilesContext } from "@/context/filesContext";

interface EditorContext {
  nodes: any[];
  edges: any[];
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
  addNodeMenuOpen: boolean;
  setAddNodeMenuOpen: (open: boolean) => void;
  addNodeMenuPosition: { x: number; y: number };
}

const editorContext = createContext<EditorContext>({
  nodes: [],
  edges: [],
  setNodes: () => {},
  setEdges: () => {},
  addNodeMenuOpen: false,
  setAddNodeMenuOpen: () => {},
  addNodeMenuPosition: { x: 0, y: 0 },
});

const useEditorContext = () => {
  return useContext(editorContext);
};

interface LayerProps {
  childLayers: LayerNode[];
  indentLevel: number;
}

interface LayerNode {
  id: string;
  name: string;
  type: string;
  children?: LayerNode[];
}

const Layers: React.FC<LayerProps> = ({ childLayers, indentLevel }) => {
  const onDragStart = (event: React.DragEvent, nodeData: LayerNode) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(nodeData),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      {childLayers.map((child, index) => (
        <AccordionItem key={child.id} value={child.id}>
          <AccordionHeader>
            <AccordionTrigger
              className="w-full text-left group"
              disabled={!child.children}
              onDragStart={(event) => onDragStart(event, child)}
              draggable
            >
              <Flex
                justify="between"
                align="center"
                style={{ marginLeft: `${8 * indentLevel}px` }}
                className={classNames(
                  "relative border-[#2b2f2e] py-2 pl-2 group-data-[state=open]:border-b",
                )}
              >
                <div className="h-[1px] w-[8px] absolute bg-[#2b2f2e] top-1/2 left-0"></div>
                <div className="h-1/2 w-[1px] absolute bg-[#2b2f2e] top-0 left-0"></div>
                {index !== childLayers.length - 1 && (
                  <div className="h-1/2 w-[1px] absolute bg-[#2b2f2e] top-1/2 left-0"></div>
                )}
                {child.children && (
                  <div className="h-1/2 w-[1px] absolute bg-[#2b2f2e] top-1/2 left-0 group-data-[state=open]:opacity-100 opacity-0"></div>
                )}
                <Flex className="gap-2 items-center whitespace-nowrap overflow-ellipsis">
                  {child.type === "FRAME" && (
                    <FrameIcon className="h-4 w-4 opacity-50" />
                  )}
                  {child.type === "ELLIPSE" && (
                    <CircleIcon className="h-4 w-4 opacity-50" />
                  )}
                  {child.type === "VECTOR" && (
                    <LiaVectorSquareSolid className="h-4 w-4 opacity-50" />
                  )}
                  {child.type === "RECTANGLE" && (
                    <SquareIcon className="h-4 w-4 opacity-50" />
                  )}
                  <Text as="div">{child.name}</Text>
                </Flex>
                {child.children && <PlusIcon />}
              </Flex>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            {child.children && (
              <Layers
                childLayers={child.children}
                indentLevel={indentLevel + 1}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </>
  );
};

function LayerReferenceNode({ data }: { data: string }) {
  const parsedData = useMemo(() => JSON.parse(data), [data]);
  return (
    <div className="bg-blue-500 relative px-2 rounded-full text-white h-8 min-w-[64px]">
      <Flex className="items-center relative w-full pr-4 pl-2 h-full">
        <Text size="2" weight="bold">
          {parsedData.name}
        </Text>
        <Handle
          type="source"
          position={Position.Right}
          id="onClick"
          className="h-2 w-2 right-0 bg-white ring-2 ring-blue-700 rounded-full"
        />
      </Flex>
    </div>
  );
}

type WrapperRef = React.RefObject<HTMLDivElement> | null;

const EdgeDragAndDropHandler = ({ wrapperRef }: { wrapperRef: WrapperRef }) => {
  const onEdgeDrop = useCallback(() => {
    // Logic for dropping an edge goes here
    // This would include opening the menu to select the node type for the new edge
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef?.current;
    if (wrapper) {
      wrapper.addEventListener("drop", onEdgeDrop);
    }
    return () => {
      if (wrapper) {
        wrapper.removeEventListener("drop", onEdgeDrop);
      }
    };
  }, [onEdgeDrop]);

  return null;
};

const LayerDragAndDropHandler = ({
  wrapperRef,
}: {
  wrapperRef: WrapperRef;
}) => {
  const { nodes, setNodes } = useEditorContext();
  const { screenToFlowPosition } = useReactFlow();

  const onLayerDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onLayerDrop = useCallback((event: DragEvent) => {
    event.preventDefault();

    if (!event.dataTransfer) return;

    const data = event.dataTransfer.getData("application/reactflow");

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: Date.now().toString(),
      type: "layer",
      position,
      data,
    };

    setNodes([...nodes, newNode]);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef?.current;
    if (wrapper) {
      wrapper.addEventListener("dragover", onLayerDragOver);
      wrapper.addEventListener("drop", onLayerDrop);
    }
    return () => {
      if (wrapper) {
        wrapper.removeEventListener("dragover", onLayerDragOver);
        wrapper.removeEventListener("drop", onLayerDrop);
      }
    };
  }, [onLayerDragOver, onLayerDrop]);

  return null;
};

const DragAndDropHandlers = ({ wrapperRef }: { wrapperRef: WrapperRef }) => {
  return (
    <>
      <LayerDragAndDropHandler wrapperRef={wrapperRef} />
      <EdgeDragAndDropHandler wrapperRef={wrapperRef} />
    </>
  );
};

const nodeTypes = {
  layer: LayerReferenceNode,
  scale: ScaleNode,
  onClick: OnClickNode,
};

const AddNodeMenu = () => {
  const { screenToFlowPosition } = useReactFlow();
  const { nodes, setNodes, setAddNodeMenuOpen, addNodeMenuPosition } =
    useEditorContext();

  function addNode(nodeType: string) {
    const position = screenToFlowPosition({
      x: addNodeMenuPosition.x,
      y: addNodeMenuPosition.y,
    });

    const newNode = {
      id: Date.now().toString(),
      type: nodeType,
      position,
    };

    setNodes([...nodes, newNode]);
    setAddNodeMenuOpen(false);
  }

  return (
    <>
      <Text size="2" weight="bold">
        Add node
      </Text>
      {Object.keys(nodeTypes)
        .filter((nodeType) => nodeType !== "layer")
        .map((result) => (
          <ContextMenuItem
            key={result}
            onSelect={() => {
              addNode(result);
            }}
          >
            {result}
          </ContextMenuItem>
        ))}
    </>
  );
};

const EditorFlow: FC<
  PropsWithChildren<{
    file: BlueprintFile;
  }>
> = ({ file, children }) => {
  const { saveFile } = useFilesContext();

  const flowWrapperRef = useRef<HTMLDivElement>(null);

  const [addNodeMenuOpen, setAddNodeMenuOpen] = useState(false);
  const [addNodeMenuPosition, setAddNodeMenuPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });

  const [nodes, setNodes] = useState<Node[]>(file.editorState.nodes);
  const [edges, setEdges] = useState<Edge[]>(file.editorState.edges);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds: Node[]) => applyNodeChanges(changes, nds));
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds));
  }, []);
  const onConnect = useCallback(
    (connection: Edge | Connection) =>
      setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onContextMenuHover = useCallback(
    (event: { clientX: any; clientY: any }) => {
      setAddNodeMenuPosition({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [setAddNodeMenuPosition],
  );

  useEffect(() => {
    saveFile({
      ...file,
      editorState: {
        nodes,
        edges,
      },
    });
  }, [nodes, edges]);

  return (
    <editorContext.Provider
      value={{
        nodes,
        edges,
        setNodes,
        setEdges,
        addNodeMenuOpen,
        setAddNodeMenuOpen,
        addNodeMenuPosition,
      }}
    >
      <ContextMenuRoot>
        <ContextMenuTrigger>
          <Theme appearance="light">
            <div
              ref={flowWrapperRef}
              onMouseMove={onContextMenuHover}
              className="h-[100vh] w-[100vw] bg-[#1E1E1E]"
            >
              <ReactFlow
                nodeTypes={nodeTypes}
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                snapToGrid
                snapGrid={[16, 16]}
              >
                {children}
                <Background gap={16} />
                <DragAndDropHandlers wrapperRef={flowWrapperRef} />
              </ReactFlow>
            </div>
          </Theme>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <AddNodeMenu />
        </ContextMenuContent>
      </ContextMenuRoot>
    </editorContext.Provider>
  );
};

function Editor({ file }: { file: BlueprintFile }) {
  return (
    <div className="relative isolate">
      <Flex className="absolute top-6 left-6 z-10" direction="column" gap="3">
        <TitlePanel />
        <Card className="w-[300px] max-w-[300px]">
          <Text size="2" weight="bold">
            Layers
          </Text>
          <Accordion type="multiple">
            {file.figmaFileContents.document.children && (
              <Layers
                indentLevel={0}
                childLayers={
                  file.figmaFileContents.document.children[0].children
                }
              />
            )}
          </Accordion>
        </Card>
      </Flex>
      <EditorFlow file={file} />
    </div>
  );
}

function Page({ params }: { params: { id: string } }) {
  const { files } = useFilesContext();

  const file = useMemo(() => {
    return files ? files[params.id] : null;
  }, [files, params.id]);

  if (!file) return null;

  return (
    <ReactFlowProvider>
      <Editor file={file} />
    </ReactFlowProvider>
  );
}

export default Page;
