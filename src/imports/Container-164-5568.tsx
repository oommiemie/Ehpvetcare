import svgPaths from "./svg-h4178be3w1";
import imgImage from "figma:asset/8619b7ade86b4481ffdfd7d284d3961ce3364615.png";

function Crown() {
  return (
    <div className="h-[20.342px] relative shrink-0 w-[25.41px]" data-name="crown 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.4102 20.3418">
          <g id="Group">
            <path d={svgPaths.p255a1500} fill="var(--fill-0, white)" id="Vector" opacity="0" />
            <path d={svgPaths.p3b862af0} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[14px] shrink-0 size-[39.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(232, 128, 42) 0%, rgb(208, 106, 26) 100%)" }}>
      <Crown />
    </div>
  );
}

function Text1() {
  return <div className="absolute bg-[#fb923c] left-[9.99px] rounded-[21243700px] shadow-[0px_0px_4px_0px_rgba(251,146,60,0.5)] size-[5.995px] top-[8.5px]" data-name="Text" />;
}

function Text() {
  return (
    <div className="bg-[rgba(255,255,255,0.9)] h-[22.99px] relative rounded-[21243700px] shrink-0 w-[56.842px]" data-name="Text">
      <Text1 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[33.48px] not-italic text-[#c2410c] text-[10px] text-center top-[3.73px] whitespace-nowrap">ไม่ว่าง</p>
    </div>
  );
}

function RoomsTab() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="RoomsTab" style={{ backgroundImage: "linear-gradient(148.782deg, rgb(255, 236, 213) 6.1733%, rgb(255, 248, 240) 93.827%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-center px-[14px] py-[12px] relative w-full">
          <Container1 />
          <p className="font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-black text-center tracking-[0.28px] whitespace-nowrap">A-01</p>
          <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#99a1af] text-[10px] text-center whitespace-nowrap">{` ห้อง VIP`}</p>
          <Text />
        </div>
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="pointer-events-none relative rounded-[21243700px] shrink-0 size-[35.998px]" data-name="Image">
      <div aria-hidden="true" className="absolute inset-0 rounded-[21243700px]">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[21243700px]" />
        <div className="absolute inset-0 overflow-hidden rounded-[21243700px]">
          <img alt="" className="absolute left-[-2.5%] max-w-none size-[105%] top-[-2.5%]" src={imgImage} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[1.899px] border-solid border-white inset-0 rounded-[21243700px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start not-italic relative shrink-0 w-[94px]">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[20px] relative shrink-0 text-[#1e2939] text-[14px] w-full">พริก</p>
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] relative shrink-0 text-[#99a1af] text-[10px] w-full">12 มี.ค. – 15 มี.ค.</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] items-center ml-0 mt-0 relative row-1 w-[138px]">
      <Image />
      <Frame1 />
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Frame2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[60px] relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] relative size-full">
          <Group />
        </div>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white relative rounded-[16px] size-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[4px] relative rounded-[inherit] size-full">
        <RoomsTab />
        <Frame />
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[1.266px] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}