"use client";

import React, {
  createContext,
  FC,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
} from "react";

import { Edge, Node } from "reactflow";

import { LOCALSTORAGE_FILES_KEY } from "@/constants";

export interface BlueprintFile {
  id: string;
  name: string;
  figmaFileContents: any;
  editorState: {
    nodes: Node[];
    edges: Edge[];
  };
}

interface FilesStorage {
  [key: string]: BlueprintFile;
}

interface FilesContextValue {
  files: FilesStorage | null;
  saveFile: (file: BlueprintFile) => void;
}

const FilesContext = createContext<FilesContextValue>({
  files: null,
  saveFile: () => {},
});

const FilesContextProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [files, setFiles] = useState<FilesStorage | null>(null);

  useEffect(() => {
    const storedFiles = localStorage.getItem(LOCALSTORAGE_FILES_KEY);

    if (storedFiles) {
      setFiles(JSON.parse(storedFiles));
    } else {
      setFiles({});
    }
  }, []);

  const saveFile = (file: BlueprintFile) => {
    setFiles((oldFiles) => {
      const newFiles = {
        ...oldFiles,
        [file.id]: {
          ...oldFiles?.[file.id],
          ...file,
        },
      };
      localStorage.setItem(LOCALSTORAGE_FILES_KEY, JSON.stringify(newFiles));
      return newFiles;
    });
  };

  return (
    <FilesContext.Provider value={{ files, saveFile }}>
      {children}
    </FilesContext.Provider>
  );
};

const useFilesContext = () => {
  const context = useContext(FilesContext);

  if (context === undefined) {
    throw new Error(
      "useFilesContext must be used within a FilesContextProvider",
    );
  }

  return context;
};

export { FilesContextProvider, useFilesContext };
