import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const MotionDiv = motion.div;

export const ContainerScroll = ({ titleComponent, children, className = "" }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.92, 1] : [0.98, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div
      className={`relative flex items-center justify-center px-2 py-4 md:px-6 md:py-10 ${className}`.trim()}
      ref={containerRef}
    >
      <div className="relative w-full py-8 md:py-16" style={{ perspective: "1000px" }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }) => {
  return (
    <MotionDiv style={{ translateY: translate }} className="mx-auto max-w-5xl">
      {titleComponent}
    </MotionDiv>
  );
};

export const Card = ({ rotate, scale, children }) => {
  return (
    <MotionDiv
      style={{ rotateX: rotate, scale }}
      className="mx-auto -mt-6 w-full max-w-6xl rounded-[32px] border border-white/10 bg-transparent p-2 md:p-4"
    >
      <div className="h-full w-full overflow-hidden rounded-[28px] bg-transparent">
        {children}
      </div>
    </MotionDiv>
  );
};
