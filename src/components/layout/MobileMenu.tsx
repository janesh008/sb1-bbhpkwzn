import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import Logo from '../ui/Logo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-cream-50 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Logo />
                  <button
                    type="button"
                    className="text-charcoal-500 hover:text-charcoal-800 focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4 space-y-6">
                  <nav className="flex flex-col space-y-4">
                    <Link 
                      to="/" 
                      className="text-lg font-medium text-charcoal-800 py-2 border-b border-cream-200"
                      onClick={onClose}
                    >
                      Home
                    </Link>
                    <Link 
                      to="/products" 
                      className="text-lg font-medium text-charcoal-800 py-2 border-b border-cream-200"
                      onClick={onClose}
                    >
                      Shop All
                    </Link>
                    <Link 
                      to="/products/gold" 
                      className="text-lg font-medium text-charcoal-800 py-2 border-b border-cream-200"
                      onClick={onClose}
                    >
                      Gold
                    </Link>
                    <Link 
                      to="/products/diamond" 
                      className="text-lg font-medium text-charcoal-800 py-2 border-b border-cream-200"
                      onClick={onClose}
                    >
                      Diamond
                    </Link>
                    <Link 
                      to="/products/silver" 
                      className="text-lg font-medium text-charcoal-800 py-2 border-b border-cream-200"
                      onClick={onClose}
                    >
                      Silver
                    </Link>
                    <Link 
                      to="/products/platinum" 
                      className="text-lg font-medium text-charcoal-800 py-2 border-b border-cream-200"
                      onClick={onClose}
                    >
                      Platinum
                    </Link>
                  </nav>

                  <div className="space-y-2">
                    <Link 
                      to="/account" 
                      className="block w-full text-center py-3 px-4 rounded-md bg-charcoal-800 text-white text-sm font-medium"
                      onClick={onClose}
                    >
                      My Account
                    </Link>
                    <Link 
                      to="/wishlist" 
                      className="block w-full text-center py-3 px-4 rounded-md bg-cream-200 text-charcoal-800 text-sm font-medium"
                      onClick={onClose}
                    >
                      My Wishlist
                    </Link>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileMenu;