<script setup lang="ts">
import type { SidebarProps } from './ui/sidebar';


import {
  Home,
  Activity,
  User,
  Settings,
} from 'lucide-vue-next';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from './ui/sidebar';

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
});

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
  },
  navMain: [
    {
      title: 'Home',
      url: '/admin',
      icon: Home,
      items: [
        {
          title: 'Overview',
          url: '/admin/',
        },
        {
          title: 'Lottery Page',
          url: '/',
        },
      ],
    },
    {
      title: 'Activities',
      url: '/admin/activity',
      icon: Activity,
      items: [
        {
          title: 'List',
          url: '/admin/activity',
        },
        {
          title: 'Create',
          url: '/admin/activity/create',
        },
      ],
    },
    {
      title: 'Users',
      url: '/admin/user',
      icon: User,
      items: [
        {
          title: 'List',
          url: '/admin/user',
        },
        {
          title: 'Create',
          url: '/admin/user/create',
        },
      ],
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings,
      items: [
        {
          title: 'Profile',
          url: '/admin/settings/profile',
        },
        {
          title: 'Password',
          url: '/admin/settings/password',
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
