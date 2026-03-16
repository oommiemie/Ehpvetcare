import svgPaths from "./svg-wxnxs39gj6";
import imgImg from "figma:asset/9a7dcf605edefcd12277b5b6fd3a46b63f43a619.png";

function Button() {
  return (
    <div className="absolute bg-[#498a4f] h-[31.982px] left-[4px] rounded-[21243700px] top-[4px] w-[90.426px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[45.5px] not-italic text-[12px] text-center text-white top-[8.09px] whitespace-nowrap">ข้อมูลทั่วไป</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute h-[31.982px] left-[94.42px] rounded-[21243700px] top-[4px] w-[135.763px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[68px] not-italic text-[#6a7282] text-[12px] text-center top-[8.09px] whitespace-nowrap">ข้อมูลทางการแพทย์</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute h-[31.982px] left-[230.19px] rounded-[21243700px] top-[4px] w-[118.006px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[59.5px] not-italic text-[#6a7282] text-[12px] text-center top-[8.09px] whitespace-nowrap">ประวัติการรักษา</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute h-[31.982px] left-[348.19px] rounded-[21243700px] top-[4px] w-[62.569px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[31.5px] not-italic text-[#6a7282] text-[12px] text-center top-[8.09px] whitespace-nowrap">วัคซีน</p>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute h-[31.982px] left-[410.76px] rounded-[21243700px] top-[4px] w-[84.293px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[42.5px] not-italic text-[#6a7282] text-[12px] text-center top-[8.09px] whitespace-nowrap">การผ่าตัด</p>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute h-[31.982px] left-[495.05px] rounded-[21243700px] top-[4px] w-[76.132px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[38.5px] not-italic text-[#6a7282] text-[12px] text-center top-[8.09px] whitespace-nowrap">ไฟล์แนบ</p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.9)] h-[39.975px] left-[16px] overflow-clip rounded-[21243700px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] top-[112.97px] w-[809.721px]" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
    </div>
  );
}

function Container2() {
  return <div className="absolute left-[16px] opacity-15 rounded-[21243700px] size-[191.991px] top-[16px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 191.99 191.99\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -13.576 -13.576 0 95.996 95.996)\\'><stop stop-color=\\'rgba(134,212,146,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(134,212,146,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(101,159,110,0.375)\\' offset=\\'0.4375\\'/><stop stop-color=\\'rgba(67,106,73,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Img() {
  return (
    <div className="h-[56.001px] relative shrink-0 w-full" data-name="img">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg} />
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[#e5e7eb] content-stretch flex flex-col h-[56.001px] items-start overflow-clip relative rounded-[21243700px] shrink-0 w-full" data-name="Container">
      <Img />
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-white h-[59.997px] relative rounded-[21243700px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pt-[1.998px] px-[1.998px] relative size-full">
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[64.983px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(106, 173, 112) 0%, rgb(73, 138, 79) 50%, rgb(58, 112, 64) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[2.493px] px-[2.493px] relative size-full">
        <Container5 />
      </div>
    </div>
  );
}

function H() {
  return (
    <div className="absolute h-[31.992px] left-0 overflow-clip top-0 w-[52.36px]" data-name="h1">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[32px] left-0 not-italic text-[#101828] text-[24px] top-[0.2px] whitespace-nowrap">บัดดี้</p>
    </div>
  );
}

function Span() {
  return (
    <div className="absolute bg-[rgba(73,138,79,0.1)] border-[0.633px] border-[rgba(73,138,79,0.2)] border-solid h-[20.26px] left-[62.35px] rounded-[21243700px] top-[5.87px] w-[85.658px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[9.99px] not-italic text-[#498a4f] text-[10px] top-[1.73px] whitespace-nowrap">HN-2026-001</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[31.992px] relative shrink-0 w-full" data-name="Container">
      <H />
      <Span />
    </div>
  );
}

function Span1() {
  return (
    <div className="absolute h-[14.997px] left-0 top-[0.49px] w-[19.359px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-[rgba(45,82,50,0.7)] top-[-0.27px] whitespace-nowrap">สุนัข</p>
    </div>
  );
}

function Span2() {
  return (
    <div className="absolute h-[15.996px] left-[27.35px] top-0 w-[4.204px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-0 not-italic text-[#498a4f] text-[12px] top-[0.1px] whitespace-nowrap">·</p>
    </div>
  );
}

function Span3() {
  return (
    <div className="absolute h-[14.997px] left-[39.55px] top-[0.49px] w-[81.968px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-[rgba(45,82,50,0.7)] top-[-0.27px] whitespace-nowrap">โกลเดน รีทรีฟเวอร์</p>
    </div>
  );
}

function Span4() {
  return (
    <div className="absolute h-[15.996px] left-[129.51px] top-0 w-[4.204px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-0 not-italic text-[#498a4f] text-[12px] top-[0.1px] whitespace-nowrap">·</p>
    </div>
  );
}

function Span5() {
  return (
    <div className="absolute h-[14.997px] left-[141.71px] top-[0.49px] w-[24.583px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-[rgba(45,82,50,0.7)] top-[-0.27px] whitespace-nowrap">เพศผู้</p>
    </div>
  );
}

function Span6() {
  return (
    <div className="absolute h-[15.996px] left-[174.28px] top-0 w-[4.204px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-0 not-italic text-[#498a4f] text-[12px] top-[0.1px] whitespace-nowrap">·</p>
    </div>
  );
}

function Span7() {
  return (
    <div className="absolute h-[14.997px] left-[186.48px] top-[0.49px] w-[15.224px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-[rgba(45,82,50,0.7)] top-[-0.27px] whitespace-nowrap">4 ปี</p>
    </div>
  );
}

function Span8() {
  return (
    <div className="absolute h-[15.996px] left-[209.7px] top-0 w-[4.204px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-0 not-italic text-[#498a4f] text-[12px] top-[0.1px] whitespace-nowrap">·</p>
    </div>
  );
}

function Span9() {
  return (
    <div className="absolute h-[14.997px] left-[221.9px] top-[0.49px] w-[39.213px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-[rgba(45,82,50,0.7)] top-[-0.27px] whitespace-nowrap">28.5 กก.</p>
    </div>
  );
}

function Span10() {
  return (
    <div className="absolute h-[15.996px] left-[269.1px] top-0 w-[3.769px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[12px] text-[rgba(73,138,79,0.2)] top-[0.1px] whitespace-nowrap">|</p>
    </div>
  );
}

function Span11() {
  return (
    <div className="absolute h-[14.997px] left-[280.86px] top-[0.49px] w-[91.317px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[0] left-0 not-italic text-[0px] text-[10px] text-[rgba(45,82,50,0.7)] top-[-0.27px] whitespace-nowrap">
        <span className="leading-[15px]">เจ้าของ:</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px]">{` สมศักดิ์ ใจดี`}</span>
      </p>
    </div>
  );
}

function Span12() {
  return (
    <div className="absolute h-[15.996px] left-[380.17px] top-0 w-[4.204px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-0 not-italic text-[#498a4f] text-[12px] top-[0.1px] whitespace-nowrap">·</p>
    </div>
  );
}

function Span13() {
  return (
    <div className="absolute h-[14.997px] left-[392.37px] top-[0.49px] w-[67.961px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-[rgba(45,82,50,0.7)] top-[-0.27px] whitespace-nowrap">081-234-5678</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <Span1 />
      <Span2 />
      <Span3 />
      <Span4 />
      <Span5 />
      <Span6 />
      <Span7 />
      <Span8 />
      <Span9 />
      <Span10 />
      <Span11 />
      <Span12 />
      <Span13 />
    </div>
  );
}

function Container7() {
  return (
    <div className="flex-[1_0_0] h-[57.979px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.993px] items-start pt-[1.998px] relative size-full">
        <Container8 />
        <Container9 />
      </div>
    </div>
  );
}

function Printer() {
  return (
    <div className="relative shrink-0 size-[11.999px]" data-name="Printer">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g clipPath="url(#clip0_53_2826)" id="Printer">
          <path d={svgPaths.p2a819b00} id="Vector" stroke="var(--stroke-0, #3B82F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p37d1ef00} id="Vector_2" stroke="var(--stroke-0, #3B82F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p36fb8a80} id="Vector_3" stroke="var(--stroke-0, #3B82F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
        <defs>
          <clipPath id="clip0_53_2826">
            <rect fill="white" height="11.9995" width="11.9995" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span14() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[50.481px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[25.5px] not-italic text-[#3b82f6] text-[12px] text-center top-[0.1px] whitespace-nowrap">พิมพ์บัตร</p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[29.252px] relative rounded-[21243700px] shrink-0 w-[93.74px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.995px] items-center pl-[12.632px] pr-[0.633px] py-[0.633px] relative size-full">
        <Printer />
        <Span14 />
      </div>
    </div>
  );
}

function Edit() {
  return (
    <div className="relative shrink-0 size-[11.999px]" data-name="Edit2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g clipPath="url(#clip0_53_2243)" id="Edit2">
          <path d={svgPaths.p2dda5b80} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
        <defs>
          <clipPath id="clip0_53_2243">
            <rect fill="white" height="11.9995" width="11.9995" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span15() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[29.766px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[15px] not-italic text-[#6a7282] text-[12px] text-center top-[0.1px] whitespace-nowrap">แก้ไข</p>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[29.252px] relative rounded-[21243700px] shrink-0 w-[73.026px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.995px] items-center pl-[12.632px] pr-[0.633px] py-[0.633px] relative size-full">
        <Edit />
        <Span15 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[33.248px] relative shrink-0 w-[172.761px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.995px] items-start pt-[3.997px] relative size-full">
        <Button6 />
        <Button7 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex gap-[15.996px] h-[96.975px] items-start left-[16px] pt-[15.996px] top-[16px] w-[809.721px]" data-name="Container">
      <Container4 />
      <Container7 />
      <Container10 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[112.971px] left-0 top-0 w-[841.713px]" data-name="Container">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Div() {
  return (
    <div className="absolute h-[168.942px] left-0 overflow-clip shadow-[0px_4px_24px_0px_rgba(73,138,79,0.1),0px_1px_6px_0px_rgba(0,0,0,0.04)] top-0 w-[841.713px]" data-name="div" style={{ backgroundImage: "linear-gradient(177.557deg, rgb(237, 245, 238) 6.9018%, rgb(226, 239, 227) 41.38%, rgb(217, 233, 218) 93.098%)" }}>
      <Container />
      <Container1 />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Icon">
          <path d="M2.666 5.99849H13.33" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M2.666 9.99749H13.33" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p15af2880} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p3acd3f80} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

function Container12() {
  return (
    <div className="bg-gradient-to-b from-[#5a9e60] relative rounded-[21243700px] shrink-0 size-[31.992px] to-[#2d5232]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">HN</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">HN-2026-001</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[90.011px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container14 />
        <Container15 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-0 pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-0 w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container12 />
      <Container13 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_58_935)" id="Icon">
          <path d={svgPaths.pc66bb00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p25a22bf0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.pf93f200} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.pc2e9d00} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_58_935">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(255, 137, 4) 0%, rgb(245, 73, 0) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">ชื่อสัตว์เลี้ยง</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">บัดดี้</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[62.856px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container19 />
        <Container20 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-[404.86px] pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-0 w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container17 />
      <Container18 />
    </div>
  );
}

function SpeciesIcon() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="SpeciesIcon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_58_919)" id="SpeciesIcon">
          <path d={svgPaths.p4c91500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M10.664 9.33099V9.66424" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.pc663000} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M5.332 9.33099V9.66424" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p3a32f200} id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_58_919">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(255, 185, 0) 0%, rgb(225, 113, 0) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <SpeciesIcon />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">ชนิดสัตว์</p>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">สุนัข</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[46.544px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container24 />
        <Container25 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-0 pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[87.24px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container22 />
      <Container23 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Icon">
          <path d="M3.999 1.9995V9.99749" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p3c5eb400} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p94fc780} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.pde7b100} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

function Container27() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(194, 122, 255) 0%, rgb(152, 16, 250) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">สายพันธุ์</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">โกลเดน รีทรีฟเวอร์</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[116.522px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container29 />
        <Container30 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-[404.86px] pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[87.24px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container27 />
      <Container28 />
    </div>
  );
}

function Span16() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[16.006px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold','Noto_Sans_Symbols:Bold',sans-serif] leading-[16px] left-0 text-[16px] text-white top-[-0.06px] whitespace-nowrap" style={{ fontVariationSettings: "'wght' 700" }}>
          ♂
        </p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(81, 162, 255) 0%, rgb(21, 93, 252) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Span16 />
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">เพศ</p>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">เพศผู้</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[35.395px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container34 />
        <Container35 />
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-0 pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[174.48px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container32 />
      <Container33 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_58_900)" id="Icon">
          <path d={svgPaths.p27f9b200} fill="var(--fill-0, white)" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p1f7dc500} fill="var(--fill-0, white)" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p227b1f00} fill="var(--fill-0, white)" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p3db3cf00} fill="var(--fill-0, white)" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p1ff76e80} id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_58_900">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container37() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(251, 100, 182) 0%, rgb(230, 0, 118) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">สี/ขน</p>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">สีทอง</p>
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[35.444px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container39 />
        <Container40 />
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-[404.86px] pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[174.48px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container37 />
      <Container38 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_58_893)" id="Icon">
          <path d={svgPaths.pb8a1600} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p36837420} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M4.6655 13.9965H11.3305" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M7.99799 1.9995V13.9965" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p32067910} id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_58_893">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container42() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(0, 213, 190) 0%, rgb(0, 150, 137) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">น้ำหนัก</p>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">28.5 กก.</p>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[55.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container44 />
        <Container45 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-0 pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[261.72px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container42 />
      <Container43 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_58_941)" id="Icon">
          <path d="M5.332 1.333V3.999" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M10.664 1.333V3.999" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p28519e00} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M1.9995 6.66499H13.9965" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_58_941">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container47() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(124, 134, 255) 0%, rgb(79, 57, 246) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">อายุ</p>
    </div>
  );
}

function Container50() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">4 ปี</p>
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[21.447px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container49 />
        <Container50 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-[404.86px] pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[261.72px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container47 />
      <Container48 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_58_907)" id="Icon">
          <path d={svgPaths.p3634a100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p2e239580} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M9.99749 1.333V2.666" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M9.99749 13.33V14.663" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M1.333 9.99749H2.666" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M1.333 5.99849H2.666" id="Vector_6" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M13.33 9.99749H14.663" id="Vector_7" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M13.33 5.99849H14.663" id="Vector_8" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M5.99849 1.333V2.666" id="Vector_9" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M5.99849 13.33V14.663" id="Vector_10" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_58_907">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container52() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(153, 161, 175) 0%, rgb(74, 85, 101) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">หมายเลขไมโครชิป</p>
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">985112345678901</p>
    </div>
  );
}

function Container53() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[125.989px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container54 />
        <Container55 />
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-0 pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[348.96px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container52 />
      <Container53 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Icon">
          <path d={svgPaths.p3bad0b00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.pd5b4600} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

function Container57() {
  return (
    <div className="bg-gradient-to-b from-[#5a9e60] relative rounded-[21243700px] shrink-0 size-[31.992px] to-[#2d5232]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">เจ้าของ</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">สมศักดิ์ ใจดี</p>
    </div>
  );
}

function Container58() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[75.202px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container59 />
        <Container60 />
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-[404.86px] pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[348.96px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container57 />
      <Container58 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_58_886)" id="Icon">
          <path d={svgPaths.p15618100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_58_886">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container62() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(81, 162, 255) 0%, rgb(21, 93, 252) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">เบอร์โทรเจ้าของ</p>
    </div>
  );
}

function Container65() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">081-234-5678</p>
    </div>
  );
}

function Container63() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[95.224px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container64 />
        <Container65 />
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-0 pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[436.2px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container62 />
      <Container63 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_58_932)" id="Icon">
          <path d={svgPaths.p3866f5f0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_58_932">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container67() {
  return (
    <div className="bg-gradient-to-b from-[#5a9e60] relative rounded-[21243700px] shrink-0 size-[31.992px] to-[#2d5232]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon9 />
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">ทำหมัน</p>
    </div>
  );
}

function Container70() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">ใช่</p>
    </div>
  );
}

function Container68() {
  return (
    <div className="h-[37.987px] relative shrink-0 w-[39.095px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <Container69 />
        <Container70 />
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.999px] h-[71.245px] items-start left-[404.86px] pb-[0.633px] pl-[16.629px] pr-[0.633px] pt-[16.629px] rounded-[14px] top-[436.2px] w-[388.86px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container67 />
      <Container68 />
    </div>
  );
}

function Div1() {
  return (
    <div className="absolute h-[507.45px] left-[24px] top-[192.94px] w-[793.715px]" data-name="div">
      <Container11 />
      <Container16 />
      <Container21 />
      <Container26 />
      <Container31 />
      <Container36 />
      <Container41 />
      <Container46 />
      <Container51 />
      <Container56 />
      <Container61 />
      <Container66 />
    </div>
  );
}

export default function MotionDiv() {
  return (
    <div className="bg-[#fefbf8] relative size-full" data-name="motion.div">
      <Div />
      <Div1 />
    </div>
  );
}