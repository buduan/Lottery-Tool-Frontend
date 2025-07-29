import { Bot, Calendar, User, Cog } from 'lucide-vue-next'

export const NAVBAR = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Bot
  },
  {
    title: 'Activities',
    url: '/admin/activities',
    icon: Calendar,
    items: [
      {
        title: 'Overview',
        url: '/admin/activities'
      },
      {
        title: 'Create',
        url: '/admin/activities/create'
      }
    ]
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: User,
    items: [
      {
        title: 'Overview',
        url: '/admin/users'
      },
      {
        title: 'Create',
        url: '/admin/users/create'
      }
    ]
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Cog
  }
]