import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/DashboardView.vue'),
    meta: { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', hiddenInNav: false }
  },
  {
    path: '/customers',
    name: 'customers',
    component: () => import(/* webpackChunkName: "customers" */ '@/views/CustomersView.vue'),
    meta: { title: 'Pelanggan', icon: 'mdi-account-group-outline' }
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: () => import(/* webpackChunkName: "tickets" */ '@/views/TicketsView.vue'),
    meta: { title: 'Tiket Dukungan', icon: 'mdi-lifebuoy' }
  },
  {
    path: '/mitras',
    name: 'mitras',
    component: () => import(/* webpackChunkName: "mitras" */ '@/views/MitrasView.vue'),
    meta: { title: 'Data Mitra', icon: 'mdi-handshake-outline' }
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import(/* webpackChunkName: "projects" */ '@/views/ProjectsView.vue'),
    meta: { title: 'Data Project', icon: 'mdi-folder-table-outline' }
  },
  {
    path: '/staff',
    name: 'staff',
    component: () => import(/* webpackChunkName: "staff" */ '@/views/StaffView.vue'),
    meta: { title: 'Data Staff', icon: 'mdi-account-hard-hat-outline' }
  },
  {
    path: '/prospects',
    name: 'prospects',
    component: () => import(/* webpackChunkName: "prospects" */ '@/views/ProspectsView.vue'),
    meta: { title: 'Calon Customer', icon: 'mdi-bullhorn-outline' }
  },
  {
    path: '/kanban',
    name: 'kanban',
    component: () => import(/* webpackChunkName: "kanban" */ '@/views/KanbanView.vue'),
    meta: { title: 'Todo Kanban', icon: 'mdi-view-column-outline' }
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: () => import(/* webpackChunkName: "catalog" */ '@/views/CatalogView.vue'),
    meta: { title: 'Produk & Jasa', icon: 'mdi-package-variant-closed' }
  },
  {
    path: '/pos',
    name: 'pos',
    component: () => import(/* webpackChunkName: "pos" */ '@/views/PosView.vue'),
    meta: { title: 'POS — Kasir', icon: 'mdi-cash-register' }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import(/* webpackChunkName: "calendar" */ '@/views/CalendarView.vue'),
    meta: { title: 'Kalender Event', icon: 'mdi-calendar-month-outline' }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import(/* webpackChunkName: "reports" */ '@/views/ReportsView.vue'),
    meta: { title: 'Laporan', icon: 'mdi-chart-box-outline' }
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: () => import(/* webpackChunkName: "calculator" */ '@/views/CalculatorView.vue'),
    meta: { title: 'Kalkulator', icon: 'mdi-calculator-variant-outline' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import(/* webpackChunkName: "settings" */ '@/views/SettingsView.vue'),
    meta: { title: 'Pengaturan', icon: 'mdi-cog-outline' }
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  scrollBehavior () { return { top: 0 } }
})

router.afterEach(to => {
  const title = to.meta && to.meta.title
  document.title = title ? `${title} — Service Management Tools` : 'Service Management Tools'
})

export default router
