import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { HelpCircle, LogOut, Menu, Receipt, Settings, SquareActivity, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useEffect, useState } from 'react';
import axios from 'axios';
import BACKEND_URL from '@/config';
import { DashboardIcon } from '@radix-ui/react-icons';

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    // const [notifications, setNotifications] = useState(3);
    const [user, setUser] = useState({ firstName: '', lastName: '', email: '' });

    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const getUserId = () => localStorage.getItem('userId') || sessionStorage.getItem('userId');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        async function fetchUserDetails() {
            try {
                const userId = getUserId();
                if (!userId) return;

                const response = await axios.get(`${BACKEND_URL}/user/${userId}`, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });

                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        }

        fetchUserDetails();
    }, []);

    const handleSignOut = () => {
        // Clear auth tokens
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');

        // Navigate to sign in
        navigate('/signin');
    };

    const navigation = [
        { name: 'Dashboard', href: '/main-room', icon: DashboardIcon },
        { name: 'Rooms', href: '/rooms', icon: Users },
        { name: 'Accounts', href: '/accounts', icon: User },
        { name: 'Expenses', href: '/expenses', icon: SquareActivity },
        { name: 'Transactions', href: '/transactions', icon: Receipt },
    ];

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
                isScrolled && 'shadow-sm'
            )}
        >
            <div className="container mx-auto">
                <div className="flex h-16 items-center px-4 md:px-6">
                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64">
                            <div className="flex flex-col space-y-4 py-4">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={cn(
                                                'flex items-center space-x-2 px-2 py-1.5 text-sm font-medium rounded-md',
                                                location.pathname === item.href
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                            <span className="font-bold text-white">S</span>
                        </div>
                        <span className="hidden font-bold text-xl md:inline-block">SettleUp</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex mx-6 items-center space-x-4 lg:space-x-6">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center space-x-1 px-2 py-1.5 text-sm font-medium rounded-md transition-colors',
                                        location.pathname === item.href
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-primary'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Section */}
                    <div className="ml-auto flex items-center space-x-4">
                        {/* Notifications */}
                        {/*<DropdownMenu>*/}
                        {/*    <DropdownMenuTrigger asChild>*/}
                        {/*        <Button variant="ghost" size="icon" className="relative">*/}
                        {/*            <Bell className="h-5 w-5" />*/}
                        {/*            {notifications > 0 && (*/}
                        {/*                <Badge*/}
                        {/*                    variant="destructive"*/}
                        {/*                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"*/}
                        {/*                >*/}
                        {/*                    {notifications}*/}
                        {/*                </Badge>*/}
                        {/*            )}*/}
                        {/*        </Button>*/}
                        {/*    </DropdownMenuTrigger>*/}
                        {/*    <DropdownMenuContent align="end" className="w-80">*/}
                        {/*        <DropdownMenuLabel>Notifications</DropdownMenuLabel>*/}
                        {/*        <DropdownMenuSeparator />*/}
                        {/*        <div className="max-h-[400px] overflow-y-auto">*/}
                        {/*            /!* Example notifications *!/*/}
                        {/*            <DropdownMenuItem className="flex flex-col items-start">*/}
                        {/*                <div className="font-medium">New expense added</div>*/}
                        {/*                <div className="text-sm text-muted-foreground">John added a new expense in "Trip to Paris"</div>*/}
                        {/*            </DropdownMenuItem>*/}
                        {/*            <DropdownMenuItem className="flex flex-col items-start">*/}
                        {/*                <div className="font-medium">Payment received</div>*/}
                        {/*                <div className="text-sm text-muted-foreground">Sarah paid you $25.00</div>*/}
                        {/*            </DropdownMenuItem>*/}
                        {/*        </div>*/}
                        {/*    </DropdownMenuContent>*/}
                        {/*</DropdownMenu>*/}

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                                            U
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/account" className="flex w-full cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/settings" className="flex w-full cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/help" className="flex w-full cursor-pointer">
                                        <HelpCircle className="mr-2 h-4 w-4" />
                                        Help & Support
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
