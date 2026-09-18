import Link from 'next/link'
import React from 'react'
import { ItemType } from 'antd/es/menu/hooks/useItems'
import { useSession } from 'next-auth/react'
import { Roles } from '@prisma/client'
import Auth from '@/components/Auth'

const buildLabel = (text: string, href?: string) =>
    text === 'login' ? (
        <Auth />
    ) : text === 'home' ? (
        <Link legacyBehavior href='/'>
            <a>Home</a>
        </Link>
    ) : (
        <Link legacyBehavior href={`/${href || text}`}>
            <a style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                {text}
            </a>
        </Link>
    )

export const NAV_KEYS = ['profile', 'play']

export type NavLinks = typeof NAV_KEYS[number]

const buildNav = (text: NavLinks): [NavLinks, ItemType] => [
    text,
    { label: buildLabel(text), key: text },
]

const PROFILE_LINK = { label: buildLabel('profile'), key: 'profile' }
const PLAY_LINK = { label: buildLabel('play'), key: 'play' }
const ADMIN_LINK = { label: buildLabel('admin'), key: 'Admin' }
const LOGIN_LINK = { label: buildLabel('login'), key: 'login' }
const METRICS_LINK = { label: buildLabel('metrics'), key: 'metrics' }
const DECKS_LINK = { label: buildLabel('decks'), key: 'decks' }
const COURSES_LINK = { label: buildLabel('courses'), key: 'courses' }
const LEARNING_TRACK_LINK = {
    label: buildLabel('Learning Tracks', 'learningTracks'),
    key: 'learningTracks',
}
const ACTIVITY_LINK = { label: buildLabel('activities'), key: 'activities' }

export const useNavLinks = () => {
    const navItems = []
    const { data: session } = useSession()

    if (session) {
        navItems.push(PROFILE_LINK)
        // TODO: allow this again
    }

    //if our user is an admin, we'll let them see that link too.
    if (session?.user?.role === Roles.ADMIN) {
        navItems.push(ADMIN_LINK)
        navItems.push(METRICS_LINK)
        navItems.push(DECKS_LINK)
        navItems.push(COURSES_LINK)
        navItems.push(LEARNING_TRACK_LINK)
        navItems.push(ACTIVITY_LINK)
        navItems.push(PLAY_LINK)
    }

    navItems.push(LOGIN_LINK)

    return navItems
}
