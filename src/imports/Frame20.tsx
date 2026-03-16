import svgPaths from "./svg-4je7ynorti";
import imgImg from "figma:asset/05c28dfb9b88df70c72b9a3c1dcf040a38ef39b7.png";

function Container1() {
  return <div className="absolute blur-[64px] h-[159.999px] left-[39.99px] opacity-18 rounded-[21243700px] top-0 w-[239.999px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 240 160\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -14.422 -14.422 0 120 80)\\'><stop stop-color=\\'rgba(147,197,253,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(147,197,253,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(110,148,190,0.375)\\' offset=\\'0.4375\\'/><stop stop-color=\\'rgba(74,99,127,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(37,49,63,0.125)\\' offset=\\'0.6125\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function ChevronLeft() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="ChevronLeft">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="ChevronLeft">
          <path d={svgPaths.p13063080} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Span() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[47.553px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[24px] not-italic text-[#6a7282] text-[12px] text-center top-[0.1px] whitespace-nowrap">ย้อนกลับ</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] h-[27.986px] relative rounded-[21243700px] shrink-0 w-[89.546px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center pl-[11.999px] relative size-full">
        <ChevronLeft />
        <Span />
      </div>
    </div>
  );
}

function Text() {
  return <div className="absolute bg-[#2b7fff] left-[10.62px] rounded-[21243700px] size-[5.995px] top-[9.63px]" data-name="Text" />;
}

function Span1() {
  return (
    <div className="bg-[#eff6ff] h-[25.255px] relative rounded-[21243700px] shrink-0 w-[90.901px]" data-name="span">
      <div aria-hidden="true" className="absolute border-[#dbeafe] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[22.61px] not-italic text-[#1447e6] text-[12px] top-[4.73px] whitespace-nowrap">กำลังตรวจ</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex h-[43.982px] items-center justify-between left-0 px-[11.999px] top-0 w-[303.38px]" data-name="Container">
      <Button />
      <Span1 />
    </div>
  );
}

function Img() {
  return (
    <div className="h-[69.999px] relative rounded-[21243700px] shrink-0 w-full" data-name="img">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImg} />
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-white h-[73.995px] relative rounded-[21243700px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pt-[1.998px] px-[1.998px] relative size-full">
        <Img />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_8px_20px_0px_rgba(59,130,246,0.1)] shrink-0 size-[79.99px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[2.997px] px-[2.997px] relative size-full">
        <Container6 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex h-[79.99px] items-start justify-center left-[19.99px] top-[12px] w-[263.395px]" data-name="Container">
      <Container5 />
    </div>
  );
}

function Span2() {
  return (
    <div className="h-[25.493px] relative shrink-0 w-[37.096px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[25.5px] left-[19px] not-italic text-[#101828] text-[17px] text-center top-[-0.27px] whitespace-nowrap">บัดดี้</p>
      </div>
    </div>
  );
}

function AlertTriangle() {
  return (
    <div className="relative shrink-0 size-[11.999px]" data-name="AlertTriangle">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g clipPath="url(#clip0_60_535)" id="AlertTriangle">
          <path d={svgPaths.p37c09000} id="Vector" stroke="var(--stroke-0, #FF6900)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d="M5.99973 4.4998V6.49971" id="Vector_2" stroke="var(--stroke-0, #FF6900)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d="M5.99973 8.49962H6.00473" id="Vector_3" stroke="var(--stroke-0, #FF6900)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
        <defs>
          <clipPath id="clip0_60_535">
            <rect fill="white" height="11.9995" width="11.9995" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span3() {
  return (
    <div className="bg-[#ffedd4] relative rounded-[21243700px] shrink-0 size-[19.993px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <AlertTriangle />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex gap-[5.995px] h-[25.493px] items-center justify-center left-[19.99px] pr-[0.01px] top-[103.99px] w-[263.395px]" data-name="Container">
      <Span2 />
      <Span3 />
    </div>
  );
}

function P() {
  return (
    <div className="absolute h-[15.996px] left-[19.99px] top-[133.48px] w-[263.395px]" data-name="p">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[132.04px] not-italic text-[12px] text-[rgba(20,71,230,0.7)] text-center top-[0.1px] whitespace-nowrap">สุนัข · Golden Retriever</p>
    </div>
  );
}

function Span4() {
  return (
    <div className="absolute bg-[#eff6ff] h-[24.494px] left-[49.24px] rounded-[21243700px] top-[0.63px] w-[66.932px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16.5px] left-[33.49px] not-italic text-[#155dfc] text-[11px] text-center top-[4.36px] whitespace-nowrap">การรักษา</p>
    </div>
  );
}

function Span5() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.6)] border-[0.633px] border-[rgba(229,231,235,0.6)] border-solid h-[25.76px] left-[122.17px] rounded-[21243700px] top-0 w-[91.969px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16.5px] left-[45.49px] not-italic text-[#6a7282] text-[11px] text-center top-[4.36px] whitespace-nowrap">HN-2026-001</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[25.76px] left-[19.99px] top-[161.47px] w-[263.395px]" data-name="Container">
      <Span4 />
      <Span5 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[207.226px] left-0 top-[43.98px] w-[303.38px]" data-name="Container">
      <Container4 />
      <Container7 />
      <P />
      <Container8 />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[251.207px] relative rounded-[16px] shrink-0 w-full" data-name="Container" style={{ backgroundImage: "linear-gradient(170.018deg, rgb(239, 246, 255) 6.9018%, rgb(224, 237, 255) 41.38%, rgb(219, 234, 254) 93.098%)" }}>
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container1 />
        <Container2 />
        <Container3 />
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_20px_0px_rgba(59,130,246,0.1)]" />
    </div>
  );
}

function ChevronUp() {
  return (
    <div className="flex-[1_0_0] h-[11.999px] min-h-px min-w-px relative" data-name="ChevronUp">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
          <div className="absolute inset-[-16.67%_-8.33%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.99969 3.99982">
              <path d={svgPaths.p38962a80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function MotionSpan() {
  return (
    <div className="content-stretch flex items-start relative size-[12px]" data-name="motion.span">
      <ChevronUp />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(153,161,175,0.1)] relative rounded-[21243700px] shrink-0" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[12px] py-[4px] relative">
        <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#99a1af] text-[10px] text-center whitespace-nowrap">ข้อมูลเพิ่ม</p>
        <div className="flex items-center justify-center relative shrink-0">
          <div className="flex-none rotate-180">
            <MotionSpan />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex h-[42.973px] items-start justify-center pr-[0.01px] pt-[9.991px] relative shrink-0 w-[287.374px]" data-name="Container">
      <Button1 />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-center relative rounded-[16px] size-full">
      <Container />
      <Container9 />
    </div>
  );
}