import svgPaths from "./svg-8xuulgict4";
import imgImg from "figma:asset/05c28dfb9b88df70c72b9a3c1dcf040a38ef39b7.png";

function Container() {
  return <div className="absolute bg-[rgba(43,127,255,0.15)] blur-[64px] h-[159.999px] left-[39.68px] rounded-[21243700px] top-0 w-[239.999px]" data-name="Container" />;
}

function Container1() {
  return <div className="absolute h-[544.269px] left-0 opacity-6 top-0 w-[320px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 320 544.27\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -31.552 -31.615 0 160 272.13)\\'><stop stop-color=\\'rgba(255,255,255,0.5)\\' offset=\\'0.0031312\\'/><stop stop-color=\\'rgba(191,191,191,0.375)\\' offset=\\'0.0023484\\'/><stop stop-color=\\'rgba(128,128,128,0.25)\\' offset=\\'0.0015656\\'/><stop stop-color=\\'rgba(64,64,64,0.125)\\' offset=\\'0.0007828\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0\\'/></radialGradient></defs></svg>')" }} />;
}

function ChevronLeft() {
  return (
    <div className="absolute left-[12px] size-[13.998px] top-[6.99px]" data-name="ChevronLeft">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="ChevronLeft">
          <path d={svgPaths.p13063080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] h-[27.986px] relative rounded-[21243700px] shrink-0 w-[91.544px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ChevronLeft />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[55.99px] not-italic text-[12px] text-[rgba(255,255,255,0.7)] text-center top-[6.1px] whitespace-nowrap">ย้อนกลับ</p>
      </div>
    </div>
  );
}

function Text() {
  return <div className="absolute bg-[#2b7fff] left-[10.62px] rounded-[21243700px] size-[5.995px] top-[11.62px]" data-name="Text" />;
}

function Span() {
  return (
    <div className="bg-[rgba(81,162,255,0.3)] h-[29.252px] relative rounded-[21243700px] shrink-0 w-[90.901px]" data-name="span">
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(81,162,255,0.25)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[22.61px] not-italic text-[#8ec5ff] text-[12px] top-[6.73px] whitespace-nowrap">กำลังตรวจ</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[53.252px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[11.999px] py-[12px] relative size-full">
          <Button />
          <Span />
        </div>
      </div>
    </div>
  );
}

function Img() {
  return (
    <div className="h-[70.008px] relative rounded-[21243700px] shrink-0 w-full" data-name="img">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImg} />
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[#1c2b42] h-[74.005px] relative rounded-[21243700px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pt-[1.998px] px-[1.998px] relative size-full">
        <Img />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.2),0px_4px_6px_0px_rgba(0,0,0,0.2)] shrink-0 size-[80px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[2.997px] px-[2.997px] relative size-full">
        <Container5 />
      </div>
    </div>
  );
}

function Div() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="div">
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex items-start justify-center pr-[0.01px] relative size-full">
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function Span1() {
  return (
    <div className="h-[25.493px] relative shrink-0 w-[37.096px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[25.5px] left-[19px] not-italic text-[17px] text-center text-white top-[-0.27px] whitespace-nowrap">บัดดี้</p>
      </div>
    </div>
  );
}

function AlertTriangle() {
  return (
    <div className="relative shrink-0 size-[11.999px]" data-name="AlertTriangle">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g clipPath="url(#clip0_39_558)" id="AlertTriangle">
          <path d={svgPaths.p37c09000} id="Vector" stroke="var(--stroke-0, #FF8904)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d="M5.99973 4.4998V6.49971" id="Vector_2" stroke="var(--stroke-0, #FF8904)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d="M5.99973 8.49962H6.00473" id="Vector_3" stroke="var(--stroke-0, #FF8904)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
        <defs>
          <clipPath id="clip0_39_558">
            <rect fill="white" height="11.9995" width="11.9995" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span2() {
  return (
    <div className="bg-[rgba(255,105,0,0.2)] relative rounded-[21243700px] shrink-0 size-[19.993px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <AlertTriangle />
      </div>
    </div>
  );
}

function Div1() {
  return (
    <div className="h-[25.493px] relative shrink-0 w-full" data-name="div">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[5.995px] items-center justify-center pr-[0.01px] relative size-full">
          <Span1 />
          <Span2 />
        </div>
      </div>
    </div>
  );
}

function P() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="p">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[140.03px] not-italic text-[12px] text-[rgba(255,255,255,0.5)] text-center top-[0.1px] whitespace-nowrap">สุนัข · Golden Retriever</p>
    </div>
  );
}

function Span3() {
  return (
    <div className="absolute bg-[rgba(81,162,255,0.3)] border-[0.633px] border-[rgba(81,162,255,0.25)] border-solid h-[25.76px] left-[56.6px] rounded-[21243700px] top-0 w-[68.198px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16.5px] left-[33.49px] not-italic text-[#8ec5ff] text-[11px] text-center top-[4.36px] whitespace-nowrap">การรักษา</p>
    </div>
  );
}

function Span4() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.08)] border-[0.633px] border-[rgba(255,255,255,0.1)] border-solid h-[25.76px] left-[130.8px] rounded-[21243700px] top-0 w-[91.969px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16.5px] left-[45.49px] not-italic text-[11px] text-[rgba(255,255,255,0.5)] text-center top-[4.36px] whitespace-nowrap">HN-2026-001</p>
    </div>
  );
}

function Div2() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-full" data-name="div">
      <Span3 />
      <Span4 />
    </div>
  );
}

function AlertTriangle1() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="AlertTriangle">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_39_563)" id="AlertTriangle">
          <path d={svgPaths.p18691d80} id="Vector" stroke="var(--stroke-0, #FF8904)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 5.24915V7.5821" id="Vector_2" stroke="var(--stroke-0, #FF8904)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 9.91505H7.00469" id="Vector_3" stroke="var(--stroke-0, #FF8904)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_39_563">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span5() {
  return (
    <div className="bg-[rgba(255,105,0,0.2)] relative rounded-[10px] shrink-0 size-[27.995px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <AlertTriangle1 />
      </div>
    </div>
  );
}

function P1() {
  return (
    <div className="h-[14.997px] relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-[rgba(255,137,4,0.7)] top-[-0.27px] tracking-[0.5px] uppercase whitespace-nowrap">แพ้ยา</p>
    </div>
  );
}

function P2() {
  return (
    <div className="h-[15.996px] overflow-clip relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-0 not-italic text-[#ffb86a] text-[12px] top-[0.1px] whitespace-nowrap">เพนิซิลิน</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[30.993px] relative shrink-0 w-[45.99px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <P1 />
        <P2 />
      </div>
    </div>
  );
}

function Div3() {
  return (
    <div className="bg-[rgba(255,105,0,0.1)] h-[52.242px] relative rounded-[14px] shrink-0 w-full" data-name="div">
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(255,105,0,0.2)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[7.993px] items-center pl-[12.632px] pr-[0.633px] py-[0.633px] relative size-full">
          <Span5 />
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function MotionDiv() {
  return (
    <div className="relative shrink-0 w-full" data-name="motion.div">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[20px] relative w-full">
        <Div />
        <Div1 />
        <P />
        <Div2 />
        <Div3 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <MotionDiv />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shrink-0 w-full" style={{ backgroundImage: "linear-gradient(rgb(23, 35, 64) 0%, rgb(28, 43, 66) 50%, rgb(30, 48, 69) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container />
      <Container1 />
      <Container2 />
      <Container3 />
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

function Frame1() {
  return (
    <div className="bg-[rgba(153,161,175,0.1)] content-stretch flex gap-[8px] items-center px-[12px] py-[4px] relative rounded-[100px] shrink-0">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#99a1af] text-[10px] text-center whitespace-nowrap">แสดงข้อมูลเพิ่มเติม</p>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-180">
          <MotionSpan />
        </div>
      </div>
    </div>
  );
}

export default function ContainerDefault() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[10px] items-center justify-center p-[8px] relative size-full" data-name="Container/Default">
      <Frame />
      <Frame1 />
    </div>
  );
}