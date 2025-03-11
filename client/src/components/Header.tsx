import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const handleSignOut = () => {
        // Add your sign out logic here
        console.log('Signing out...');
    };

    return (
        <header className="border-b">
            <div className="flex h-16 items-center px-4">
                <div className="flex w-full justify-between items-center">
                    {/* App Name/Logo */}
                    <div className="font-semibold text-lg">Your App Name</div>

                    {/* Navigation Links */}
                    <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
                        <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                            Home
                        </Link>
                        <Link to="/main-room" className="text-sm font-medium transition-colors hover:text-primary">
                            Rooms
                        </Link>
                        <Link to="/account" className="text-sm font-medium transition-colors hover:text-primary">
                            Account
                        </Link>
                    </nav>

                    {/* Profile Section */}
                    <div className="flex items-center space-x-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-8 w-8 cursor-pointer">
                                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem asChild>
                                    <Link to="/account" className="w-full cursor-pointer">
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
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
