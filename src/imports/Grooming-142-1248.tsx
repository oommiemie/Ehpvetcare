import imgImage from "figma:asset/ff29aa8946c5f6c82c17c1baa99e0994598ce10e.png";
import imgImage1 from "figma:asset/1bd8c45a87a17f1b4a62a000b76f4ad961bedccd.png";

function Image() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="Image (ก่อนทำ)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
    </div>
  );
}

function Container() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[80px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Image />
      </div>
    </div>
  );
}

function Image1() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="Image (หลังทำ)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[80px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Image1 />
      </div>
    </div>
  );
}

export default function Grooming() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative size-full" data-name="Grooming">
      <Container />
      <Container1 />
    </div>
  );
}