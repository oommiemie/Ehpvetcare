import svgPaths from "./svg-93s2cv4grl";
import imgImg from "figma:asset/05c28dfb9b88df70c72b9a3c1dcf040a38ef39b7.png";

function Container1() {
  return <div className="absolute bg-[rgba(43,127,255,0.15)] blur-[64px] h-[159.999px] left-[39.68px] rounded-[21243700px] top-0 w-[239.999px]" data-name="Container" />;
}

function Container2() {
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

function Container3() {
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

function Container6() {
  return (
    <div className="bg-[#1c2b42] h-[74.005px] relative rounded-[21243700px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pt-[1.998px] px-[1.998px] relative size-full">
        <Img />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.2),0px_4px_6px_0px_rgba(0,0,0,0.2)] shrink-0 size-[80px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[2.997px] px-[2.997px] relative size-full">
        <Container6 />
      </div>
    </div>
  );
}

function Div() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="div">
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex items-start justify-center pr-[0.01px] relative size-full">
          <Container5 />
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

function Container7() {
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
          <Container7 />
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

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <MotionDiv />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shrink-0 w-full" style={{ backgroundImage: "linear-gradient(rgb(23, 35, 64) 0%, rgb(28, 43, 66) 50%, rgb(30, 48, 69) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container1 />
      <Container2 />
      <Container3 />
      <Container4 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[13.333px] relative shrink-0 text-[rgba(16,24,40,0.5)]">เพศ</p>
      <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] relative shrink-0 text-[#101828]">ผู้</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[13.333px] relative shrink-0 text-[rgba(16,24,40,0.5)]">น้ำหนัก</p>
      <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] relative shrink-0 text-[#101828]">28.5 กก.</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[13.333px] relative shrink-0 text-[rgba(16,24,40,0.5)]">อายุ</p>
      <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] relative shrink-0 text-[#101828]">2 ปี</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[13.333px] relative shrink-0 text-[rgba(16,24,40,0.5)]">เจ้าของ</p>
      <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] relative shrink-0 text-[#101828]">สมศักดิ์ ใจดี</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[13.333px] relative shrink-0 text-[rgba(16,24,40,0.5)]">โทร</p>
      <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] relative shrink-0 text-[#101828]">081-234-5678</p>
    </div>
  );
}

function Div4() {
  return (
    <div className="relative shrink-0 w-full" data-name="div">
      <div className="content-stretch flex flex-col gap-[16px] items-start not-italic px-[16px] relative text-[12px] w-full whitespace-nowrap">
        <Container8 />
        <Container9 />
        <Container10 />
        <Container11 />
        <Container12 />
      </div>
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
    <div className="content-stretch flex items-start relative shrink-0 size-[12px]" data-name="motion.span">
      <ChevronUp />
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[rgba(153,161,175,0.1)] content-stretch flex gap-[8px] items-center px-[12px] py-[4px] relative rounded-[100px] shrink-0">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#99a1af] text-[10px] text-center whitespace-nowrap">ย่อข้อมูล</p>
      <MotionSpan />
    </div>
  );
}

function ContainerVariant() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center justify-center overflow-clip pb-[10px] relative rounded-bl-[16px] rounded-br-[16px] shrink-0 w-full" data-name="Container/Variant3" style={{ backgroundImage: "linear-gradient(90deg, rgb(249, 250, 251) 0%, rgb(249, 250, 251) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Frame />
      <Div4 />
      <Frame1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-start p-[8px] relative w-full">
        <ContainerVariant />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_40_207)" id="Icon">
          <path d={svgPaths.p3033f780} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1ed96f00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 6.41562H9.33182" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 9.33181H9.33182" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M4.66591 6.41562H4.67174" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M4.66591 9.33181H4.67174" id="Vector_6" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_40_207">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span6() {
  return (
    <div className="absolute bg-[#498a4f] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(73,138,79,0.25),0px_1px_2px_0px_rgba(73,138,79,0.25)] size-[27.995px] top-[9.99px]" data-name="span">
      <Icon />
    </div>
  );
}

function Span7() {
  return (
    <div className="absolute h-[17.331px] left-[49.99px] top-[15.32px] w-[84.115px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[17.333px] left-0 not-italic text-[#3a7040] text-[13px] top-[-0.53px] whitespace-nowrap">บันทึกส่งตรวจ</p>
    </div>
  );
}

function Div5() {
  return <div className="absolute bg-[#498a4f] h-[19.993px] left-0 rounded-[21243700px] top-[13.99px] w-[2.997px]" data-name="div" />;
}

function Button1() {
  return (
    <div className="absolute bg-gradient-to-r from-[rgba(73,138,79,0.12)] h-[47.978px] left-[7.99px] rounded-[14px] to-[rgba(73,138,79,0.05)] top-[16px] w-[303.38px]" data-name="button">
      <Span6 />
      <Span7 />
      <Div5 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_40_219)" id="Icon">
          <path d={svgPaths.p26841040} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_40_219">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span8() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[9.99px]" data-name="span">
      <Icon1 />
    </div>
  );
}

function Span9() {
  return (
    <div className="absolute h-[17.331px] left-[49.99px] top-[15.32px] w-[70.285px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[17.333px] left-0 not-italic text-[#6a7282] text-[13px] top-[-0.53px] whitespace-nowrap">สัญญาณชีพ</p>
    </div>
  );
}

function Div6() {
  return <div className="absolute h-0 left-0 rounded-[21243700px] top-[23.99px] w-[2.997px]" data-name="div" />;
}

function Button2() {
  return (
    <div className="absolute h-[47.978px] left-[7.99px] rounded-[14px] top-[63.97px] w-[303.38px]" data-name="button">
      <Span8 />
      <Span9 />
      <Div6 />
    </div>
  );
}

function Container13() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-[5.99px] w-[279.381px]" data-name="Container" />;
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_40_227)" id="Icon">
          <path d="M6.41562 1.16648V2.33295" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M2.91619 1.16648V2.33295" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p26485a0} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p391df560} id="Vector_4" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3b5dff00} id="Vector_5" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_40_227">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span10() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[9.99px]" data-name="span">
      <Icon2 />
    </div>
  );
}

function Span11() {
  return (
    <div className="absolute h-[17.331px] left-[49.99px] top-[15.32px] w-[75.38px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[17.333px] left-0 not-italic text-[#6a7282] text-[13px] top-[-0.53px] whitespace-nowrap">ตรวจร่างกาย</p>
    </div>
  );
}

function Div8() {
  return <div className="absolute h-0 left-0 rounded-[21243700px] top-[23.99px] w-[2.997px]" data-name="div" />;
}

function Button3() {
  return (
    <div className="absolute h-[47.978px] left-0 rounded-[14px] top-[12.62px] w-[303.38px]" data-name="button">
      <Span10 />
      <Span11 />
      <Div8 />
    </div>
  );
}

function Div7() {
  return (
    <div className="absolute h-[60.601px] left-[7.99px] top-[111.95px] w-[303.38px]" data-name="div">
      <Container13 />
      <Button3 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_40_215)" id="Icon">
          <path d="M6.99886 4.08267V12.248" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.pdef1400} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_40_215">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span12() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[9.99px]" data-name="span">
      <Icon3 />
    </div>
  );
}

function Span13() {
  return (
    <div className="absolute h-[17.331px] left-[49.99px] top-[15.32px] w-[40.588px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[17.333px] left-0 not-italic text-[#6a7282] text-[13px] top-[-0.53px] whitespace-nowrap">วินิจฉัย</p>
    </div>
  );
}

function Div9() {
  return <div className="absolute h-0 left-0 rounded-[21243700px] top-[23.99px] w-[2.997px]" data-name="div" />;
}

function Button4() {
  return (
    <div className="absolute h-[47.978px] left-[7.99px] rounded-[14px] top-[172.55px] w-[303.38px]" data-name="button">
      <Span12 />
      <Span13 />
      <Div9 />
    </div>
  );
}

function Container14() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-[5.99px] w-[279.381px]" data-name="Container" />;
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_40_199)" id="Icon">
          <path d={svgPaths.pdc05080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1fed7280} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1f3e7f00} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1e4f6bc0} id="Vector_4" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3ee10680} id="Vector_5" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p7e114f0} id="Vector_6" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_40_199">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span14() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[9.99px]" data-name="span">
      <Icon4 />
    </div>
  );
}

function Span15() {
  return (
    <div className="absolute h-[17.331px] left-[49.99px] top-[15.32px] w-[33.12px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[17.333px] left-0 not-italic text-[#6a7282] text-[13px] top-[-0.53px] whitespace-nowrap">วัคซีน</p>
    </div>
  );
}

function Div11() {
  return <div className="absolute h-0 left-0 rounded-[21243700px] top-[23.99px] w-[2.997px]" data-name="div" />;
}

function Button5() {
  return (
    <div className="absolute h-[47.978px] left-0 rounded-[14px] top-[12.62px] w-[303.38px]" data-name="button">
      <Span14 />
      <Span15 />
      <Div11 />
    </div>
  );
}

function Div10() {
  return (
    <div className="absolute h-[60.601px] left-[7.99px] top-[220.53px] w-[303.38px]" data-name="div">
      <Container14 />
      <Button5 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_40_222)" id="Icon">
          <path d={svgPaths.p2b434980} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M3.76364 8.74858H10.2341" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M4.95753 1.16648H9.0402" id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_40_222">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span16() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[9.99px]" data-name="span">
      <Icon5 />
    </div>
  );
}

function Span17() {
  return (
    <div className="absolute h-[17.331px] left-[49.99px] top-[15.32px] w-[85.49px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[17.333px] left-0 not-italic text-[#6a7282] text-[13px] top-[-0.53px] whitespace-nowrap">แล็บ / เอกซเรย์</p>
    </div>
  );
}

function Div12() {
  return <div className="absolute h-0 left-0 rounded-[21243700px] top-[23.99px] w-[2.997px]" data-name="div" />;
}

function Button6() {
  return (
    <div className="absolute h-[47.978px] left-[7.99px] rounded-[14px] top-[281.13px] w-[303.38px]" data-name="button">
      <Span16 />
      <Span17 />
      <Div12 />
    </div>
  );
}

function Container15() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-[5.99px] w-[279.381px]" data-name="Container" />;
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_40_195)" id="Icon">
          <path d={svgPaths.p317b880} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3ffd700} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_40_195">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span18() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[9.99px]" data-name="span">
      <Icon6 />
    </div>
  );
}

function Span19() {
  return (
    <div className="absolute h-[17.331px] left-[49.99px] top-[15.32px] w-[43.744px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[17.333px] left-0 not-italic text-[#6a7282] text-[13px] top-[-0.53px] whitespace-nowrap">ใบสั่งยา</p>
    </div>
  );
}

function Div14() {
  return <div className="absolute h-0 left-0 rounded-[21243700px] top-[23.99px] w-[2.997px]" data-name="div" />;
}

function Button7() {
  return (
    <div className="absolute h-[47.978px] left-0 rounded-[14px] top-[12.62px] w-[303.38px]" data-name="button">
      <Span18 />
      <Span19 />
      <Div14 />
    </div>
  );
}

function Div13() {
  return (
    <div className="absolute h-[60.601px] left-[7.99px] top-[329.11px] w-[303.38px]" data-name="div">
      <Container15 />
      <Button7 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_40_190)" id="Icon">
          <path d={svgPaths.p21910d70} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1ad28a00} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 10.2067V3.79105" id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_40_190">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span20() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[9.99px]" data-name="span">
      <Icon7 />
    </div>
  );
}

function Span21() {
  return (
    <div className="absolute h-[17.331px] left-[49.99px] top-[15.32px] w-[54.022px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[17.333px] left-0 not-italic text-[#6a7282] text-[13px] top-[-0.53px] whitespace-nowrap">ค่าบริการ</p>
    </div>
  );
}

function Div15() {
  return <div className="absolute h-0 left-0 rounded-[21243700px] top-[23.99px] w-[2.997px]" data-name="div" />;
}

function Button8() {
  return (
    <div className="absolute h-[47.978px] left-[7.99px] rounded-[14px] top-[389.71px] w-[303.38px]" data-name="button">
      <Span20 />
      <Span21 />
      <Div15 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_40_184)" id="Icon">
          <path d="M4.66591 1.16648V3.49943" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M9.33181 1.16648V3.49943" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1a9c7e80} id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M1.74972 5.83238H12.248" id="Vector_4" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_40_184">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span22() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[9.99px]" data-name="span">
      <Icon8 />
    </div>
  );
}

function Span23() {
  return (
    <div className="absolute h-[17.331px] left-[49.99px] top-[15.32px] w-[50.59px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[17.333px] left-0 not-italic text-[#6a7282] text-[13px] top-[-0.53px] whitespace-nowrap">นัดหมาย</p>
    </div>
  );
}

function Div16() {
  return <div className="absolute h-0 left-0 rounded-[21243700px] top-[23.99px] w-[2.997px]" data-name="div" />;
}

function Button9() {
  return (
    <div className="absolute h-[47.978px] left-[7.99px] rounded-[14px] top-[437.69px] w-[303.38px]" data-name="button">
      <Span22 />
      <Span23 />
      <Div16 />
    </div>
  );
}

function Nav() {
  return (
    <div className="h-[501.663px] relative shrink-0 w-full" data-name="nav">
      <Button1 />
      <Button2 />
      <Div7 />
      <Button4 />
      <Div10 />
      <Button6 />
      <Div13 />
      <Button8 />
      <Button9 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white relative size-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start relative size-full">
        <Frame2 />
        <Nav />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-r-[0.633px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}