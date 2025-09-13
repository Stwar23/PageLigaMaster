import React, { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/App';

const Header = ({ navItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNavLinkClick = (item) => {
    if (item.action) {
      item.action();
      navigate('/');
    }
    setIsOpen(false);
    setOpenSubMenu(null);
  };

  const handleSubMenuToggle = (itemName) => {
    setOpenSubMenu(openSubMenu === itemName ? null : itemName);
  };

  const renderNavItem = (item, isMobile = false) => {
    if (item.subMenu && item.subMenu.length > 0) {
      return (
        <div className="relative group">
          <button
            onClick={() => !isMobile && handleSubMenuToggle(item.name)}
            onMouseEnter={() => !isMobile && setOpenSubMenu(item.name)}
            onMouseLeave={() =>
              !isMobile &&
              setTimeout(() => {
                if (!document.querySelector('.group:hover .submenu-desktop')) {
                  setOpenSubMenu(null);
                }
              }, 100)
            }
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors duration-300 w-full text-left md:w-auto',
              openSubMenu === item.name
                ? 'bg-primary/20 text-primary'
                : 'text-foreground hover:bg-primary/10 hover:text-primary'
            )}
          >
            {item.icon}
            <span>{item.name}</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                openSubMenu === item.name ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSubMenu === item.name && !isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                'absolute top-full mt-2 w-56 rounded-md shadow-lg bg-card/90 backdrop-blur-md ring-1 ring-primary/20 ring-opacity-5 focus:outline-none py-1 z-20 submenu-desktop',
                item.subMenuOffset || 'left-0'
              )}
              onMouseEnter={() => setOpenSubMenu(item.name)}
              onMouseLeave={() => setOpenSubMenu(null)}
            >
              {item.subMenu.map((subItem) => (
                <NavLink
                  key={subItem.name}
                  to={subItem.path}
                  onClick={() => handleNavLinkClick(subItem)}
                  className={({ isActive }) =>
                    cn(
                      'block px-4 py-2 text-sm flex items-center space-x-2',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary'
                    )
                  }
                >
                  {subItem.icon}
                  <span>{subItem.name}</span>
                </NavLink>
              ))}
            </motion.div>
          )}
          {isMobile && openSubMenu === item.name && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-4"
            >
              {item.subMenu.map((subItem) => (
                <NavLink
                  key={subItem.name}
                  to={subItem.path}
                  onClick={() => handleNavLinkClick(subItem)}
                  className={({ isActive }) =>
                    cn(
                      'block px-3 py-2 rounded-md text-sm flex items-center space-x-2',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary'
                    )
                  }
                >
                  {subItem.icon}
                  <span>{subItem.name}</span>
                </NavLink>
              ))}
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={() => handleNavLinkClick(item)}
        className={({ isActive }) =>
          cn(
            'px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors duration-300',
            isActive
              ? 'bg-primary/20 text-primary'
              : 'text-foreground hover:bg-primary/10 hover:text-primary',
            isMobile ? 'text-base py-3' : ''
          )
        }
      >
        {item.icon}
        <span>{item.name}</span>
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg shadow-lg border-b border-primary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="flex items-center space-x-3"
            onClick={() => {
              setIsOpen(false);
              setOpenSubMenu(null);
            }}
          >
            <img
              src="https://igxdgvxcfiucrlqizrhj.supabase.co/storage/v1/object/sign/imagenespagina/ia.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80NGE0Y2ZhMC02NWVmLTRlMDgtYmVkZS03Yjc5ZGI2NDYxMjIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5lc3BhZ2luYS9pYS5wbmciLCJpYXQiOjE3NTA3Mjg2MjEsImV4cCI6MTc4MjI2NDYyMX0.36OYAFxvhC3hSem2kQA1hULP_JrxkdSQW_6ejmOWcss"
              alt="Zona Norte Logo"
              className="h-12 w-12 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary font-orbitron">
                Zona Norte
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-1 items-center">
            {navItems.map((item) => (
              <div key={item.name}>{renderNavItem(item, false)}</div>
            ))}
          </nav>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X size={24} className="text-primary" />
              ) : (
                <Menu size={24} className="text-primary" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 border-t border-primary/20"
          >
            <nav className="flex flex-col space-y-1 px-2 py-3">
              {navItems.map((item) => (
                <div key={item.name}>{renderNavItem(item, true)}</div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
