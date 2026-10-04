import React from "react";
import { InfoFeature } from "../types";
import BeautyIcon from "./icons/BeautyIcon";
interface InfoSectionProps {
  features: InfoFeature[];
}
const InfoSection: React.FC<InfoSectionProps> = ({ features }) => (
  <section className="benefits" aria-label="Comprar con Makeup Glamours">
    <div className="shop-shell benefits-grid">
      {features.map((feature, index) => (
        <div className="benefit" key={feature.id}>
          <BeautyIcon
            kind={(["heart", "truck", "chat"] as const)[index % 3]}
            className="h-6 w-6"
          />
          <div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
export default InfoSection;
