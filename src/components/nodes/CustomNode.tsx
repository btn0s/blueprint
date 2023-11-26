import React, { FC, ReactNode, useState } from "react";

import { Box, Flex, Text, TextFieldInput } from "@radix-ui/themes";
import { FaRobot } from "react-icons/fa";
import { Handle, HandleProps, NodeProps, Position } from "reactflow";

const CircleHandle = ({
  id,
  type,
  position,
}: Pick<HandleProps, "id" | "type" | "position">) => {
  return (
    <Handle
      type={type}
      id={id}
      position={position}
      className="h-3 w-3 left-0 bg-white relative top-0 transform-none border-2 border-blue-700 rounded-full"
    />
  );
};

const ExecuteHandle = ({
  id,
  type,
  position,
}: Pick<HandleProps, "id" | "type" | "position">) => {
  return (
    <Handle
      id={id}
      type={type}
      position={position}
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
          strokeWidth="3"
        />
      </svg>
    </Handle>
  );
};

const ExecuteHandleIn = () => (
  <ExecuteHandle type="target" id="execute-input" position={Position.Left} />
);
const ExecuteHandleOut = () => (
  <ExecuteHandle type="source" id="execute-output" position={Position.Right} />
);

interface CustomNodeProps extends NodeProps {
  rows: {
    left: ReactNode | null;
    right: ReactNode | null;
  }[];
}

const CustomNode: FC<CustomNodeProps> = ({ type, rows }) => {
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
        {Object.values(rows).map((row, index) => (
          <Flex key={index} className="justify-between relative">
            <Flex className="flex-1 justify-start">{row.left}</Flex>
            <Flex className="flex-1 justify-end">{row.right}</Flex>
          </Flex>
        ))}
      </Flex>
    </div>
  );
};
const TargetHandle = () => {
  return (
    <Flex className="relative gap-2 items-center">
      <CircleHandle type="target" id="target" position={Position.Left} />
      <Text size="1">Target</Text>
    </Flex>
  );
};

export function ScaleNode(props: NodeProps) {
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  const propsWithRows: CustomNodeProps = {
    ...props,
    rows: [
      {
        left: <ExecuteHandleIn />,
        right: <ExecuteHandleOut />,
      },
      {
        left: <TargetHandle />,
        right: (
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
      {
        left: null,
        right: (
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
    ],
  };

  return <CustomNode {...propsWithRows} />;
}
export function OnClickNode(props: NodeProps) {
  const propsWithRows: CustomNodeProps = {
    ...props,
    rows: [
      {
        left: null,
        right: <ExecuteHandleOut />,
      },
      {
        left: <TargetHandle />,
        right: null,
      },
    ],
  };
  return <CustomNode {...propsWithRows} />;
}
