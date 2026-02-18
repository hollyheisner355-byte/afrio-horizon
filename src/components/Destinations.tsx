import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import kenyaImg from "@/assets/kenya.jpg";
import tanzaniaImg from "@/assets/tanzania.jpg";
import southAfricaImg from "@/assets/south-africa.jpg";
import zanzibarImg from "@/assets/zanzibar.jpg";

const destinations = [
  {
    name: "Kenya",
    description: "Masai Mara, Great Migration & Amboseli",
    image: kenyaImg,
    tours: 12,
  },
  {
    name: "Tanzania",
    description: "Serengeti, Kilimanjaro & Ngorongoro Crater",
    image: tanzaniaImg,
    tours: 15,
  },
  {
    name: "South Africa",
    description: "Kruger, Cape Town & Garden Route",
    image: southAfricaImg,
    tours: 10,
  },
  {
    name: "Zanzibar",
    description: "Pristine beaches, spice tours & culture",
    image: zanzibarImg,
    tours: 8,
  },
];

const Destinations = () => {
  return (
    <section id="destinations" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">
            Where We Go
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Destinations
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From the vast savannas of East Africa to the dramatic coastlines of the South
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-safari-brown/80 via-safari-brown/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <MapPin size={16} />
                  <span className="text-sm font-medium">{dest.tours} Tours</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-primary-foreground mb-1">
                  {dest.name}
                </h3>
                <p className="text-primary-foreground/70 text-sm">{dest.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
