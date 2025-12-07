import { Calendar, Hexagon, Home, Inbox, Search, Settings } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../ui/sidebar'
import Link from 'next/link'
import FooterUser from './footer-user'

const AppSidebar = () => {
  // Menu items.
  const items = [
    {
      title: "Home",
      url: "#",
      icon: Home,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ]
  return (
    <div>
      <Sidebar collapsible='icon' variant='inset'>
        <SidebarHeader className='px-0'>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className='py-6' asChild>
                <Link className='' href="/admin">
                  <Hexagon strokeWidth={3} className="text-primary" />
                  <span className="text-base font-semibold">Hexa Shop</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {items.map((item, index) => (
              <SidebarMenuItem
                key={index}>
                <SidebarMenuButton asChild>
                  <Link href={item.url} className="flex items-center gap-2 w-full">
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <FooterUser />
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}

export default AppSidebar