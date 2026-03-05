import { motion } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import kenyaImg from "@/assets/kenya.jpg";
import tanzaniaImg from "@/assets/tanzania.jpg";
import southAfricaImg from "@/assets/south-africa.jpg";
import zanzibarImg from "@/assets/zanzibar.jpg";

const destinations = [
  { name: "Kenya", description: "Masai Mara, Great Migration & Amboseli", image: kenyaImg, tours: 12 },
  { name: "Tanzania", description: "Serengeti, Kilimanjaro & Ngorongoro Crater", image: tanzaniaImg, tours: 15 },
  { name: "South Africa", description: "Kruger, Cape Town & Garden Route", image: southAfricaImg, tours: 10 },
  { name: "Zanzibar", description: "Pristine beaches, spice tours & culture", image: zanzibarImg, tours: 8 },
];

const Destinations = () => {
  return (
    <section id="destinations" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs mb-3">
              Where We Go
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Our Destinations
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-base max-w-md"
          >
            From the vast savannas of East Africa to the dramatic coastlines of the South
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
            >
              <img
                src={dest.image}
                alt={`Safari destination ${dest.name}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(25_35%_8%/0.85)] via-[hsl(25_35%_8%/0.2)] to-transparent" />
              
              {/* Hover arrow */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight size={18} className="text-primary-foreground" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <MapPin size={14} />
                  <span className="text-xs font-semibold tracking-wider uppercase">{dest.tours} Tours</span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-primary-foreground mb-1">
                  {dest.name}
                </h3>
                <p className="text-primary-foreground/60 text-sm">{dest.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
