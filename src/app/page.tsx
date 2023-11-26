"use client";

import React, { MouseEventHandler, useRef } from "react";

import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Inset,
  Text,
  TextFieldInput,
} from "@radix-ui/themes";
import Link from "next/link";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Background, ReactFlow } from "reactflow";

import TitlePanel from "@/components/TitlePanel";
import { useFigmaContext } from "@/context/figmaContext";
import { BlueprintFile, useFilesContext } from "@/context/filesContext";

function getFileKey(pageUrl: string) {
  const parser = document.createElement("a");
  parser.href = pageUrl;
  return parser.pathname.replace("/file/", "").replace(/\/.*/, "");
}

async function importFile(token: string, file: any): Promise<BlueprintFile> {
  const fileKey = getFileKey(file);
  const apiUrl = `https://api.figma.com/v1/files/${fileKey}`;
  const figmaFileContents = await fetch(apiUrl, {
    headers: {
      "X-Figma-Token": token,
    },
  });
  const contents = await figmaFileContents.json();
  return {
    id: fileKey,
    name: contents.name,
    figmaFileContents: contents,
    editorState: {
      nodes: [],
      edges: [],
    },
  };
}

const ImportFilePanel = () => {
  const { token, setToken } = useFigmaContext();
  const { saveFile } = useFilesContext();

  const fileUrlInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile: MouseEventHandler = (e) => {
    const fileUrl = fileUrlInputRef.current?.value;

    if (!token || !fileUrl) return;

    importFile(token, fileUrl).then((file) => {
      saveFile(file);
    });
  };

  return (
    <Card>
      <Text as="div" size="2" weight="bold">
        Import file
      </Text>
      <Flex gap="4" align="end">
        <Box>
          <Text size="1">File URL</Text>
          <TextFieldInput
            ref={fileUrlInputRef}
            placeholder="https://www.figma.com/file/..."
            type="url"
          />
        </Box>
        <Box>
          <Text size="1">Personal access token</Text>
          <TextFieldInput
            value={token ? token : ""}
            onChange={(e) => setToken(e.target.value)}
            type="password"
          />
        </Box>
        <Button onClick={handleImportFile}>Import</Button>
      </Flex>
    </Card>
  );
};

export default function Home() {
  const { files } = useFilesContext();

  return (
    <div className="relative isolate">
      <Flex className="absolute top-6 left-6 z-10" direction="column" gap="3">
        <TitlePanel />
        <Card>
          <Box>
            <Text as="div" size="2" weight="bold" className="mb-2">
              Recent files
            </Text>
            {files === null && (
              <div className="bg-black/10 p-4 flex items-center h-[157px] justify-center rounde-md w-full">
                <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin" />
              </div>
            )}
            {files && Object.keys(files).length === 0 && (
              <Text>No files found.</Text>
            )}
            {files && (
              <Grid columns="4" className="w-full">
                {files &&
                  Object.keys(files).map((fileKey) => (
                    <Card
                      className="relative"
                      key={
                        files[fileKey].figmaFileContents?.document?.id ||
                        files[fileKey].figmaFileContents?.id
                      }
                      size="2"
                    >
                      <Link
                        href={`/file/${fileKey}`}
                        className="absolute inset-0"
                      >
                        <span className="sr-only">
                          {`Link to file: ${files[fileKey].name}`}
                        </span>
                      </Link>
                      <Inset clip="padding-box" side="top" pb="current">
                        <img
                          src={
                            files[fileKey].figmaFileContents?.thumbnailUrl ||
                            files[fileKey].figmaFileContents?.document
                              ?.thumbnailUrl
                          }
                          alt="Bold typography"
                          className="w-full h-[100px] bg-[#1E1E1E] block object-cover"
                        />
                      </Inset>
                      <Text as="p" size="2">
                        {files[fileKey].name}
                      </Text>
                    </Card>
                  ))}
              </Grid>
            )}
          </Box>
        </Card>
        <ImportFilePanel />
      </Flex>
      <div className="h-[100vh] w-[100vw] bg-[#1E1E1E] pointer-events-none">
        <ReactFlow>
          <Background gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
