import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router-dom'
import { Flower } from '@/components/brand/Flower'
import { Toaster } from '@/components/ui'
import DashLayout from '@/components/layout/DashLayout'

const L = (fn) => lazy(fn)
const Landing = L(() => import('@/pages/public/LandingPage'))
const Explore = L(() => import('@/pages/public/ExplorePage'))
const Signup = L(() => import('@/pages/public/SignupPage'))
const Onboarding = L(() => import('@/pages/public/OnboardingPage'))
const Login = L(() => import('@/pages/public/LoginPage'))
const Forgot = L(() => import('@/pages/public/ForgotPage'))
const Reset = L(() => import('@/pages/public/ResetPage'))
const NotFound = L(() => import('@/pages/public/NotFoundPage'))
const Creator = L(() => import('@/pages/creator/CreatorPage'))
const PostView = L(() => import('@/pages/creator/PostPage'))

const DashHome = L(() => import('@/pages/dash/HomePage'))
const Supporters = L(() => import('@/pages/dash/SupportersPage'))
const Membership = L(() => import('@/pages/dash/MembershipPage'))
const Shop = L(() => import('@/pages/dash/ShopPage'))
const Wishlist = L(() => import('@/pages/dash/WishlistPage'))
const Invite = L(() => import('@/pages/dash/InvitePage'))
const Posts = L(() => import('@/pages/dash/PostsPage'))
const PostEditor = L(() => import('@/pages/dash/PostEditorPage'))
const Gallery = L(() => import('@/pages/dash/GalleryPage'))
const Messages = L(() => import('@/pages/dash/MessagesPage'))
const Buttons = L(() => import('@/pages/dash/ButtonsPage'))
const Integrations = L(() => import('@/pages/dash/IntegrationsPage'))
const Payout = L(() => import('@/pages/dash/PayoutPage'))
const Settings = L(() => import('@/pages/dash/SettingsPage'))
const Account = L(() => import('@/pages/dash/AccountPage'))

function Loading() {
  return <div className="min-h-dvh grid place-items-center"><Flower size={40} spin /></div>
}

/** Khung cho các trang công khai (không có thanh bên) */
function PublicRoot() {
  return (
    <>
      <Suspense fallback={<Loading />}><Outlet /></Suspense>
      <Toaster />
      <ScrollRestoration />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <PublicRoot />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/kham-pha', element: <Explore /> },
      { path: '/dang-ky', element: <Signup /> },
      { path: '/hoan-thien', element: <Onboarding /> },
      { path: '/dang-nhap', element: <Login /> },
      { path: '/quen-mat-khau', element: <Forgot /> },
      { path: '/dat-lai-mat-khau', element: <Reset /> },
      { path: '/:username', element: <Creator /> },
      { path: '/:username/bai-viet/:postId', element: <PostView /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/quan-ly',
    element: <DashLayout />,
    children: [
      { index: true, element: <DashHome /> },
      { path: 'ung-ho', element: <Supporters /> },
      { path: 'hoi-vien', element: <Membership /> },
      { path: 'cua-hang', element: <Shop /> },
      { path: 'mong-uoc', element: <Wishlist /> },
      { path: 'gioi-thieu', element: <Invite /> },
      { path: 'bai-viet', element: <Posts /> },
      { path: 'bai-viet/moi', element: <PostEditor /> },
      { path: 'bai-viet/:postId', element: <PostEditor /> },
      { path: 'bo-anh', element: <Gallery /> },
      { path: 'tin-nhan', element: <Messages /> },
      { path: 'nut-va-hinh', element: <Buttons /> },
      { path: 'tich-hop', element: <Integrations /> },
      { path: 'rut-tien', element: <Payout /> },
      { path: 'cai-dat', element: <Settings /> },
      { path: 'tai-khoan', element: <Account /> },
    ],
  },
])
