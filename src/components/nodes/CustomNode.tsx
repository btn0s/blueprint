import { Box, Flex, Text, TextFieldInput } from "@radix-ui/themes";
import React, { FC, ReactNode, useState } from "react";
import { FaRobot } from "react-icons/fa";
import { Handle, NodeProps, Position } from "reactflow";

const ExecuteHandleIn = () => {
  return (
    <Handle
      type="target"
      position={Position.Left}
      id="input"
      className="bg-transparent rounded-none h-fit w-fit relative top-0 left-0 transform-none"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
      >
        <path
          d="M2 20V4C2 2.89543 2.89543 2 4 2H8.68629C10.2776 2 11.8037 2.63214 12.9289 3.75736L18.3431 9.17157C19.9052 10.7337 19.9052 13.2663 18.3431 14.8284L12.9289 20.2426C11.8037 21.3679 10.2776 22 8.68629 22H4C2.89543 22 2 21.1046 2 20Z"
          fill="white"
          stroke="black"
          stroke-width="3"
        />
      </svg>
    </Handle>
  );
};
const ExecuteHandleOut = () => {
  return (
    <Handle
      type="source"
      position={Position.Right}
      id="execute"
      className="bg-transparent rounded-none h-fit w-fit relative top-0 left-0 transform-none"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
      >
        <path
          d="M2 20V4C2 2.89543 2.89543 2 4 2H8.68629C10.2776 2 11.8037 2.63214 12.9289 3.75736L18.3431 9.17157C19.9052 10.7337 19.9052 13.2663 18.3431 14.8284L12.9289 20.2426C11.8037 21.3679 10.2776 22 8.68629 22H4C2.89543 22 2 21.1046 2 20Z"
          fill="white"
          stroke="black"
          stroke-width="3"
        />
      </svg>
    </Handle>
  );
};

interface CustomNodeProps extends NodeProps {
  data: {
    executeIn: boolean;
    executeOut: boolean;
    componentRows: {
      [key: number]: {
        left: () => ReactNode | null;
        right: () => ReactNode | null;
      };
    };
  };
}

const CustomNode: FC<CustomNodeProps> = ({ type, data }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-2xl border border-black/20 min-w-[150px]">
      <Box className="p-2 bg-gray-800 text-white">
        <Box>
          <Flex className="items-center gap-2">
            <FaRobot className="w-4 h-4" />
            <Text as="div" size="2" weight="bold">
              {type}
            </Text>
          </Flex>
        </Box>
      </Box>
      <Flex className="flex-col gap-2 p-2 bg-white">
        <Flex className="justify-between relative">
          <Box>{data.executeIn && <ExecuteHandleIn />}</Box>
          <Box>{data.executeOut && <ExecuteHandleOut />}</Box>
        </Flex>
        {Object.values(data.componentRows).map((row, index) => (
          <Flex key={index} className="justify-between relative">
            <Box className="flex-1">{row.left()}</Box>
            <Box className="flex-1">{row.right()}</Box>
          </Flex>
        ))}
      </Flex>
    </div>
  );
};
const TargetHandle = () => {
  return (
    <Flex className="relative gap-2 items-center">
      <Handle
        type="target"
        id="target"
        position={Position.Left}
        className="h-2 w-2 left-0 bg-white relative top-0 transform-none ring-2 ring-blue-700 rounded-full"
      />
      <Text size="1">Target</Text>
    </Flex>
  );
};

export function ScaleNode(props: NodeProps) {
  const propsWithHandleRows: CustomNodeProps = {
    ...props,
    data: {
      ...JSON.parse(props.data || "{}"),
      executeIn: true,
      executeOut: true,
      componentRows: {
        0: {
          left: () => <TargetHandle />,
          right: () => (
            <Flex className="items-center gap-2">
              <Text size="2">X</Text>
              <TextFieldInput
                size="1"
                value={scaleX}
                onChange={(event) => {
                  setScaleX(parseFloat(event.target.value));
                }}
              />
            </Flex>
          ),
        },
        1: {
          left: () => null,
          right: () => (
            <Flex className="items-center gap-2">
              <Text size="2">Y</Text>
              <TextFieldInput
                size="1"
                value={scaleY}
                onChange={(event) => {
                  setScaleY(parseFloat(event.target.value));
                }}
              />
            </Flex>
          ),
        },
      },
    },
  };

  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  return <CustomNode {...propsWithHandleRows} />;
}

export function OnClickNode(props: NodeProps) {
  const propsWithHandleRows: CustomNodeProps = {
    ...props,
    data: {
      ...JSON.parse(props.data || "{}"),
      executeOut: true,
      componentRows: {
        0: {
          left: () => <TargetHandle />,
          right: () => null,
        },
      },
    },
  };
  return <CustomNode {...propsWithHandleRows} />;
}
