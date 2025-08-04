<script setup lang="ts">
import type { SidebarProps } from '../ui/sidebar';
import NavMain from '@/components/admin/NavMain.vue';
import NavUser from '@/components/admin/NavUser.vue';
import { Bot, Sparkles, Settings2 } from 'lucide-vue-next';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '../ui/sidebar';

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
});

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: Bot,
    },
    {
      title: 'Activities',
      url: '#',
      icon: Sparkles,
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
