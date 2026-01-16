import type { Meta, StoryObj } from "@storybook/react";
import { Home, Settings, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
} from "./sidebar";

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-semibold">My App</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav>
            <SidebarNavItem href="#" active>
              <Home className="mr-2 h-4 w-4" />
              Home
            </SidebarNavItem>
            <SidebarNavItem href="#">
              <User className="mr-2 h-4 w-4" />
              Profile
            </SidebarNavItem>
            <SidebarNavItem href="#">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </SidebarNavItem>
          </SidebarNav>
        </SidebarContent>
        <SidebarFooter>
          <p className="text-xs text-muted-foreground">© 2024 My App</p>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Main Content</h1>
        <p className="mt-4 text-muted-foreground">
          This is the main content area.
        </p>
      </main>
    </div>
  ),
};
