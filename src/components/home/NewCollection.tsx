import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const NewCollection = () => {
  return (
    <section className="py-16 bg-cream-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            className="font-serif text-3xl md:text-4xl text-charcoal-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            New Arrivals
          </motion.h2>
          <motion.div 
            className="w-20 h-1 bg-gold-400 mx-auto mb-6"
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.p 
            className="text-charcoal-500 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Discover our latest pieces, crafted with passion and precision for those who appreciate timeless elegance.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="relative h-96 rounded-lg overflow-hidden group"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "url('https://images.pexels.com/photos/9428842/pexels-photo-9428842.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h3 className="font-serif text-2xl mb-2">Spring Collection 2025</h3>
              <p className="text-cream-100 mb-4">Embrace the season with our new spring-inspired pieces.</p>
              <Link to="/products">
                <Button variant="outline" className="border-cream-100 text-cream-100 hover:bg-cream-100/10">
                  Explore Collection
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            className="relative h-96 rounded-lg overflow-hidden group"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "url('https://images.pexels.com/photos/10187727/pexels-photo-10187727.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h3 className="font-serif text-2xl mb-2">Limited Edition</h3>
              <p className="text-cream-100 mb-4">Exclusive pieces crafted in limited quantities.</p>
              <Link to="/products">
                <Button variant="outline" className="border-cream-100 text-cream-100 hover:bg-cream-100/10">
                  Shop Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewCollection;