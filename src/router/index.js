import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/test',
    name: 'StoreTest',
    component: () => import('../views/StoreTest.vue')
  },
  {
    path: '/course-setup',
    name: 'CourseSetup',
    component: () => import('../views/CourseSetup.vue')
  },
  {
    path: '/course/:courseId',
    name: 'CourseView',
    component: () => import('../views/CourseView.vue'),
    props: true,
    children: [
      {
        // Default child route redirects to topics
        path: '',
        redirect: to => ({
          name: 'TopicManager',
          params: { courseId: to.params.courseId }
        })
      },
      {
        path: 'topics',
        name: 'TopicManager',
        component: () => import('../views/TopicManager.vue'),
        props: true
      },
      {
        path: 'topic/:topicId/pages',
        name: 'PageManager',
        component: () => import('../views/PageManager.vue'),
        props: true
      },
      {
        path: 'settings',
        name: 'CourseSettings',
        component: () => import('../views/CourseSetup.vue'),
        props: true
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 