import svgPaths from "./svg-rs9qd06w47";
import imgImg from "figma:asset/05c28dfb9b88df70c72b9a3c1dcf040a38ef39b7.png";

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

function Button() {
  return (
    <div className="absolute bg-[rgba(153,161,175,0.1)] content-stretch flex gap-[4px] items-center left-[110.02px] px-[12px] py-[4px] rounded-[21243700px] top-[263.21px]" data-name="button">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#99a1af] text-[10px] text-center whitespace-nowrap">ข้อมูลเพิ่ม</p>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-180">
          <MotionSpan />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-[0.633px] border-solid border-white h-[251.207px] left-0 rounded-[16px] shadow-[0px_4px_20px_0px_rgba(59,130,246,0.1)] top-0 w-[303.38px]" data-name="Container" />;
}

function Container4() {
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

function Button1() {
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

function Container5() {
  return (
    <div className="absolute content-stretch flex h-[43.982px] items-center justify-between left-0 px-[11.999px] top-0 w-[303.38px]" data-name="Container">
      <Button1 />
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

function Container9() {
  return (
    <div className="bg-white h-[73.995px] relative rounded-[21243700px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pt-[1.998px] px-[1.998px] relative size-full">
        <Img />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_8px_20px_0px_rgba(59,130,246,0.1)] shrink-0 size-[79.99px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[2.997px] px-[2.997px] relative size-full">
        <Container9 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex h-[79.99px] items-start justify-center left-[19.99px] top-[12px] w-[263.395px]" data-name="Container">
      <Container8 />
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

function Container10() {
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

function Container11() {
  return (
    <div className="absolute h-[25.76px] left-[19.99px] top-[161.47px] w-[263.395px]" data-name="Container">
      <Span4 />
      <Span5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[207.226px] left-0 top-[43.98px] w-[303.38px]" data-name="Container">
      <Container7 />
      <Container10 />
      <P />
      <Container11 />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[251.207px] left-0 overflow-clip rounded-[16px] top-0 w-[303.38px]" data-name="Container" style={{ backgroundImage: "linear-gradient(170.018deg, rgb(239, 246, 255) 6.9018%, rgb(224, 237, 255) 41.38%, rgb(219, 234, 254) 93.098%)" }}>
      <Container3 />
      <Container4 />
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[298.196px] left-[7.99px] rounded-[16px] top-[7.99px] w-[303.38px]" data-name="Container" style={{ backgroundImage: "linear-gradient(168.199deg, rgba(239, 246, 255, 0.1) 6.9018%, rgba(224, 237, 255, 0.1) 41.38%, rgba(219, 234, 254, 0.1) 93.098%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Button />
      <Container2 />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_61_612)" id="Icon">
          <path d={svgPaths.p3033f780} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1ed96f00} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 6.41562H9.33182" id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 9.33181H9.33182" id="Vector_4" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M4.66591 6.41562H4.67174" id="Vector_5" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M4.66591 9.33181H4.67174" id="Vector_6" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_61_612">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[12px]" data-name="div">
      <Icon />
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute h-[51.994px] left-[7.99px] rounded-[14px] top-[12px] w-[303.38px]" data-name="button">
      <Div />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[19.5px] left-[91.49px] not-italic text-[#6a7282] text-[13px] text-center top-[14.98px] whitespace-nowrap">บันทึกส่งตรวจ</p>
    </div>
  );
}

function Container12() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-0 w-[279.381px]" data-name="Container" />;
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_61_620)" id="Icon">
          <path d={svgPaths.p26841040} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_61_620">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div2() {
  return (
    <div className="absolute bg-[#498a4f] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(73,138,79,0.25),0px_1px_2px_0px_rgba(73,138,79,0.25)] size-[27.995px] top-[12px]" data-name="div">
      <Icon1 />
    </div>
  );
}

function Div3() {
  return <div className="absolute bg-[#498a4f] h-[19.993px] left-0 rounded-br-[21243700px] rounded-tr-[21243700px] top-[16px] w-[2.997px]" data-name="div" />;
}

function Button3() {
  return (
    <div className="absolute bg-gradient-to-r from-[rgba(73,138,79,0.12)] h-[51.994px] left-0 rounded-[14px] to-[rgba(73,138,79,0.05)] top-[0.63px] w-[303.38px]" data-name="button">
      <Div2 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[19.5px] left-[86.49px] not-italic text-[#3a7040] text-[13px] text-center top-[14.98px] whitespace-nowrap">สัญญาณชีพ</p>
      <Div3 />
    </div>
  );
}

function Div1() {
  return (
    <div className="absolute h-[52.627px] left-[7.99px] top-[63.99px] w-[303.38px]" data-name="div">
      <Container12 />
      <Button3 />
    </div>
  );
}

function Container13() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-0 w-[279.381px]" data-name="Container" />;
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

function Div5() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[12px]" data-name="div">
      <Icon2 />
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute h-[51.994px] left-0 rounded-[14px] top-[0.63px] w-[303.38px]" data-name="button">
      <Div5 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[19.5px] left-[87.99px] not-italic text-[#6a7282] text-[13px] text-center top-[14.98px] whitespace-nowrap">ตรวจร่างกาย</p>
    </div>
  );
}

function Div4() {
  return (
    <div className="absolute h-[52.627px] left-[7.99px] top-[116.62px] w-[303.38px]" data-name="div">
      <Container13 />
      <Button4 />
    </div>
  );
}

function Container14() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-0 w-[279.381px]" data-name="Container" />;
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

function Div7() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[12px]" data-name="div">
      <Icon3 />
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute h-[51.994px] left-0 rounded-[14px] top-[0.63px] w-[303.38px]" data-name="button">
      <Div7 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[19.5px] left-[70.49px] not-italic text-[#6a7282] text-[13px] text-center top-[14.98px] whitespace-nowrap">วินิจฉัย</p>
    </div>
  );
}

function Div6() {
  return (
    <div className="absolute h-[52.627px] left-[7.99px] top-[169.25px] w-[303.38px]" data-name="div">
      <Container14 />
      <Button5 />
    </div>
  );
}

function Container15() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-0 w-[279.381px]" data-name="Container" />;
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

function Div9() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[12px]" data-name="div">
      <Icon4 />
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute h-[51.994px] left-0 rounded-[14px] top-[0.63px] w-[303.38px]" data-name="button">
      <Div9 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[19.5px] left-[66.99px] not-italic text-[#6a7282] text-[13px] text-center top-[14.98px] whitespace-nowrap">วัคซีน</p>
    </div>
  );
}

function Div8() {
  return (
    <div className="absolute h-[52.627px] left-[7.99px] top-[221.88px] w-[303.38px]" data-name="div">
      <Container15 />
      <Button6 />
    </div>
  );
}

function Container16() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-0 w-[279.381px]" data-name="Container" />;
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

function Div11() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[12px]" data-name="div">
      <Icon5 />
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute h-[51.994px] left-0 rounded-[14px] top-[0.63px] w-[303.38px]" data-name="button">
      <Div11 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[19.5px] left-[92.99px] not-italic text-[#6a7282] text-[13px] text-center top-[14.98px] whitespace-nowrap">แล็บ / เอกซเรย์</p>
    </div>
  );
}

function Div10() {
  return (
    <div className="absolute h-[52.627px] left-[7.99px] top-[274.5px] w-[303.38px]" data-name="div">
      <Container16 />
      <Button7 />
    </div>
  );
}

function Container17() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-0 w-[279.381px]" data-name="Container" />;
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

function Div13() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[12px]" data-name="div">
      <Icon6 />
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute h-[51.994px] left-0 rounded-[14px] top-[0.63px] w-[303.38px]" data-name="button">
      <Div13 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[19.5px] left-[71.99px] not-italic text-[#6a7282] text-[13px] text-center top-[14.98px] whitespace-nowrap">ใบสั่งยา</p>
    </div>
  );
}

function Div12() {
  return (
    <div className="absolute h-[52.627px] left-[7.99px] top-[327.13px] w-[303.38px]" data-name="div">
      <Container17 />
      <Button8 />
    </div>
  );
}

function Container18() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-0 w-[279.381px]" data-name="Container" />;
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

function Div15() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[12px]" data-name="div">
      <Icon7 />
    </div>
  );
}

function Button9() {
  return (
    <div className="absolute h-[51.994px] left-0 rounded-[14px] top-[0.63px] w-[303.38px]" data-name="button">
      <Div15 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[19.5px] left-[77.49px] not-italic text-[#6a7282] text-[13px] text-center top-[14.98px] whitespace-nowrap">ค่าบริการ</p>
    </div>
  );
}

function Div14() {
  return (
    <div className="absolute h-[52.627px] left-[7.99px] top-[379.76px] w-[303.38px]" data-name="div">
      <Container18 />
      <Button9 />
    </div>
  );
}

function Container19() {
  return <div className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] h-[0.633px] left-[12px] top-0 w-[279.381px]" data-name="Container" />;
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

function Div17() {
  return (
    <div className="absolute bg-[rgba(243,244,246,0.8)] content-stretch flex items-center justify-center left-[12px] pr-[0.01px] rounded-[10px] size-[27.995px] top-[12px]" data-name="div">
      <Icon8 />
    </div>
  );
}

function Button10() {
  return (
    <div className="absolute h-[51.994px] left-0 rounded-[14px] top-[0.63px] w-[303.38px]" data-name="button">
      <Div17 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[19.5px] left-[75.49px] not-italic text-[#6a7282] text-[13px] text-center top-[14.98px] whitespace-nowrap">นัดหมาย</p>
    </div>
  );
}

function Div16() {
  return (
    <div className="absolute h-[52.627px] left-[7.99px] top-[432.39px] w-[303.38px]" data-name="div">
      <Container19 />
      <Button10 />
    </div>
  );
}

function Nav() {
  return (
    <div className="absolute h-[489.99px] left-0 overflow-clip top-[306.19px] w-[319.366px]" data-name="nav">
      <Button2 />
      <Div1 />
      <Div4 />
      <Div6 />
      <Div8 />
      <Div10 />
      <Div12 />
      <Div14 />
      <Div16 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white border-[rgba(229,231,235,0.7)] border-r-[0.633px] border-solid relative size-full" data-name="Container">
      <Container1 />
      <Nav />
    </div>
  );
}