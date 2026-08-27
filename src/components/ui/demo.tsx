"use client";

import { useState } from "react";

import { Download, Palette, Type } from "lucide-react";

import {
  TreeFolder,
  TreeItem,
  TreeSection,
  TreeView,
} from "@/components/ui/animated-file-tree";

export default function TreeViewDemo() {
  const [selectedId, setSelectedId] = useState("announcement");

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-background p-6">
      <div className="w-full max-w-[240px] rounded-lg bg-card py-2">
        <TreeView
          variant="line"
          activeColor="text-orange-600 dark:text-orange-500"
          selectedId={selectedId}
          onSelect={handleSelect}
        >
          <TreeSection title="Getting Started" defaultExpanded={true}>
            <TreeItem id="installation" label="Installation" icon={Download} />
          </TreeSection>

          <TreeSection title="Foundations" defaultExpanded={true}>
            <TreeItem id="color" label="Color" icon={Palette} />
            <TreeItem id="typography" label="Typography" icon={Type} />
          </TreeSection>

          <TreeSection title="Base" defaultExpanded={true}>
            <TreeItem id="announcement" label="Announcement" />
            <TreeItem id="avatar" label="Avatar" />
            <TreeItem id="badge" label="Badge" />
            <TreeItem id="breadcrumb" label="Breadcrumb" />

            <TreeFolder id="buttons-folder" label="Buttons" defaultExpanded={false}>
              <TreeItem id="button" label="Button" />
              <TreeItem id="button-group" label="Button Group" />
              <TreeItem id="icon-button" label="Icon Button" />
              <TreeItem id="link-button" label="Link Button" />
            </TreeFolder>

            <TreeItem id="carousel" label="Carousel" badge="NEW" />
            <TreeItem id="checkbox" label="Checkbox" />
            <TreeItem id="chip" label="Chip" />
            <TreeItem id="close-button" label="Close Button" />
            <TreeItem id="date-picker" label="Date Picker" />
            <TreeItem id="divider" label="Divider" />
            <TreeItem id="dropdown" label="Dropdown" />

            <TreeFolder id="forms-folder" label="Form Controls" defaultExpanded={false}>
              <TreeItem id="input" label="Input" />
              <TreeItem id="input-otp" label="Input OTP" badge="NEW" />
              <TreeItem id="file-upload" label="File Upload" badge="NEW" />
              <TreeItem id="radio" label="Radio" />
            </TreeFolder>

            <TreeItem id="notification" label="Notification" badge="NEW" />
            <TreeItem id="pagination" label="Pagination" />
          </TreeSection>
        </TreeView>
      </div>
    </div>
  );
}
