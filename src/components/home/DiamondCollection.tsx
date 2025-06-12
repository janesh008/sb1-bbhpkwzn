import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const DiamondCollection = () => {
  return (
    <section className="py-16 bg-cream-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal-800 mb-4">
                Discover Our Diamond Collection
              </h2>
              <div className="w-20 h-1 bg-gold-400 mb-6" />
              <p className="text-charcoal-600 mb-8">
                Each diamond in our collection is carefully selected for its exceptional quality and brilliance. 
                Our expert craftsmen create stunning pieces that showcase the natural beauty of these precious stones.
              </p>
              <Link to="/products/diamond">
                <Button>
                  View Collection
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/12808501/pexels-photo-12808501.jpeg?auto=compress&cs=tinysrgb&w=1600" 
                  alt="Diamond Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiamondCollection;