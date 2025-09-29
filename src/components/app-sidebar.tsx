"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  // Frame,
  GalleryVerticalEnd,
  // Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

// Dados personalizados para o sistema de padaria
const data = {
  user: {
    name: "Admin",
    email: "admin@paozinho.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Pãozinho Delícia",
      logo: GalleryVerticalEnd,
      plan: "Premium",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
      isActive: true,
    },
    {
      title: "Produtos",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Todos os Produtos",
          url: "/produtos",
        },
        {
          title: "Categorias",
          url: "/categorias",
        },
        {
          title: "Preços personalizados",
          url: "/precos-personalizados",
        },
      ],
    },
    {
      title: "Clientes",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Lista de Clientes",
          url: "/clientes",
        },
        {
          title: "Novo Cliente",
          url: "/clientes/novo",
        },
        {
          title: "Relatórios",
          url: "/clientes/relatorios",
        },
      ],
    },
    {
      title: "Vendas",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Vendas",
          url: "/vendas",
        },
        {
          title: "Nova Venda",
          url: "/vendas/nova",
        },
        {
          title: "Relatórios",
          url: "/vendas/relatorio",
        },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Perfil",
          url: "/configuracoes/perfil",
        },
        {
          title: "Sistema",
          url: "/configuracoes/sistema",
        },
        {
          title: "Backup",
          url: "/configuracoes/backup",
        },
      ],
    },
  ],
  /*
  projects: [
    {
      name: "Relatórios",
      url: "/relatorios",
      icon: Frame,
    },
    {
      name: "Financeiro",
      url: "/financeiro",
      icon: PieChart,
    },
    {
      name: "Mapa de Vendas",
      url: "/mapa-vendas",
      icon: Map,
    },
  ],
  */
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*<NavProjects projects={data.projects} />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={
          {
            name: user?.displayName || "",
            email: user?.email || "",
            avatar: user?.photoURL || "",
          }
        } />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
