import svgPaths from "./svg-yspcyba8fl";

function Span() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[80.069px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] top-[0.1px] whitespace-nowrap">ตรวจแล้ว 0/12</p>
      </div>
    </div>
  );
}

function Container4() {
  return <div className="bg-[#498a4f] h-[5.995px] rounded-[21243700px] shrink-0 w-full" data-name="Container" />;
}

function Container3() {
  return (
    <div className="bg-[#f3f4f6] h-[5.995px] relative rounded-[21243700px] shrink-0 w-[95.996px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pr-[95.996px] relative rounded-[inherit] size-full">
        <Container4 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[184.058px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.993px] items-center relative size-full">
        <Span />
        <Container3 />
      </div>
    </div>
  );
}

function Check() {
  return (
    <div className="absolute left-[12.63px] size-[11.999px] top-[8.63px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #498A4F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(73,138,79,0.08)] h-[29.252px] relative rounded-[21243700px] shrink-0 w-[110.102px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(73,138,79,0.2)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[64.13px] not-italic text-[#498a4f] text-[12px] text-center top-[6.73px] whitespace-nowrap">ปกติทั้งหมด</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[29.252px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container2 />
          <Button />
        </div>
      </div>
    </div>
  );
}

function GroupIcon() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="GroupIcon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_341)" id="GroupIcon">
          <path d={svgPaths.p20965380} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1f57da00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_341">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div() {
  return (
    <div className="relative rounded-[10px] shadow-[0px_2px_6px_0px_rgba(73,138,79,0.3)] shrink-0 size-[27.995px]" data-name="div" style={{ backgroundImage: "linear-gradient(135deg, rgb(73, 138, 79) 0%, rgb(58, 112, 64) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <GroupIcon />
      </div>
    </div>
  );
}

function Span1() {
  return (
    <div className="absolute h-[17.49px] left-0 overflow-clip top-0 w-[104.79px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[17.5px] left-0 not-italic text-[#1e2939] text-[14px] top-[-0.17px] whitespace-nowrap">ศีรษะและใบหน้า</p>
    </div>
  );
}

function Div1() {
  return (
    <div className="h-[41.479px] relative shrink-0 w-[104.79px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span1 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">{`Head & Face · 0/4`}</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[9.991px] items-center relative size-full">
        <Div />
        <Div1 />
      </div>
    </div>
  );
}

function Check1() {
  return (
    <div className="relative shrink-0 size-[9.991px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99131 9.99131">
        <g id="Check">
          <path d={svgPaths.p2b3c2180} id="Vector" stroke="var(--stroke-0, #498A4F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832609" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white relative rounded-[21243700px] shrink-0" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(73,138,79,0.2)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center px-[8px] py-[2px] relative">
        <Check1 />
        <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#498a4f] text-[10px] text-center whitespace-nowrap">ปกติทุกข้อ</p>
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="h-[15.996px] overflow-clip relative shrink-0 w-full" data-name="ChevronDown">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33099 5.33199">
            <path d={svgPaths.p146dab00} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MotionSpan() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="motion.span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <ChevronDown />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Button2 />
        <MotionSpan />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[rgba(249,250,251,0.8)] content-stretch flex h-[61.461px] items-center justify-between px-[15.996px] relative shrink-0 w-[907.161px]" data-name="Container">
      <Button1 />
      <Container7 />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_341)" id="GroupIcon">
          <path d={svgPaths.p20965380} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1f57da00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_341">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Span2() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">ตา</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span2 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Eyes)</p>
      </div>
    </div>
  );
}

function Check2() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check2 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button3 />
        <Button4 />
        <Button5 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[15.996px] relative size-full">
          <Container10 />
          <Container11 />
          <Container12 />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_400)" id="Icon">
          <path d={svgPaths.p128ffa00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1118a6c0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_400">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Span3() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">หู</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span3 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Ears)</p>
      </div>
    </div>
  );
}

function Check3() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check3 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X1() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X1 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button6 />
        <Button7 />
        <Button8 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[15.996px] relative size-full">
          <Container14 />
          <Container15 />
          <Container16 />
        </div>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_345)" id="Icon">
          <path d={svgPaths.p2f5d4000} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p26fff380} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p46b50c0} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_345">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Span4() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">จมูก</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span4 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Nose)</p>
      </div>
    </div>
  );
}

function Check4() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check4 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X2() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X2 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button9 />
        <Button10 />
        <Button11 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[15.996px] relative size-full">
          <Container18 />
          <Container19 />
          <Container20 />
        </div>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_372)" id="Icon">
          <path d="M6.41562 1.16648V2.33295" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M2.91619 1.16648V2.33295" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p26485a0} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p391df560} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3b5dff00} id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_372">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Span5() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">ปาก/ฟัน</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span5 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Mouth/Teeth)</p>
      </div>
    </div>
  );
}

function Check5() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check5 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X3() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X3 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button14() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button12 />
        <Button13 />
        <Button14 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center px-[15.996px] relative size-full">
          <Container22 />
          <Container23 />
          <Container24 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[0.633px] h-[247.745px] items-start overflow-clip relative shrink-0 w-[907.161px]" data-name="Container">
      <Container9 />
      <Container13 />
      <Container17 />
      <Container21 />
    </div>
  );
}

function Container5() {
  return (
    <div className="relative rounded-[14px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-px relative w-full">
          <Container6 />
          <Container8 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(16,24,40,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function GroupIcon1() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="GroupIcon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_383)" id="GroupIcon">
          <path d={svgPaths.p3df21100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_383">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div2() {
  return (
    <div className="relative rounded-[10px] shadow-[0px_2px_6px_0px_rgba(73,138,79,0.3)] shrink-0 size-[27.995px]" data-name="div" style={{ backgroundImage: "linear-gradient(135deg, rgb(73, 138, 79) 0%, rgb(58, 112, 64) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <GroupIcon1 />
      </div>
    </div>
  );
}

function Span6() {
  return (
    <div className="absolute h-[17.49px] left-0 overflow-clip top-0 w-[104.79px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[17.5px] left-0 not-italic text-[#1e2939] text-[14px] top-[-0.17px] whitespace-nowrap">อวัยวะภายใน</p>
    </div>
  );
}

function Div3() {
  return (
    <div className="h-[41.479px] relative shrink-0 w-[104.79px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span6 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">Internal Systems · 0/4</p>
      </div>
    </div>
  );
}

function Button15() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[9.991px] items-center relative size-full">
        <Div2 />
        <Div3 />
      </div>
    </div>
  );
}

function Check6() {
  return (
    <div className="relative shrink-0 size-[9.991px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99131 9.99131">
        <g id="Check">
          <path d={svgPaths.p2b3c2180} id="Vector" stroke="var(--stroke-0, #498A4F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832609" />
        </g>
      </svg>
    </div>
  );
}

function Button16() {
  return (
    <div className="bg-white relative rounded-[21243700px] shrink-0" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(73,138,79,0.2)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center px-[8px] py-[2px] relative">
        <Check6 />
        <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#498a4f] text-[10px] text-center whitespace-nowrap">ปกติทุกข้อ</p>
      </div>
    </div>
  );
}

function ChevronDown1() {
  return (
    <div className="h-[15.996px] overflow-clip relative shrink-0 w-full" data-name="ChevronDown">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33099 5.33199">
            <path d={svgPaths.p146dab00} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MotionSpan1() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="motion.span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <ChevronDown1 />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Button16 />
        <MotionSpan1 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="bg-[rgba(249,250,251,0.8)] content-stretch flex h-[61.461px] items-center justify-between px-[15.996px] relative shrink-0 w-[907.161px]" data-name="Container">
      <Button15 />
      <Container27 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_383)" id="GroupIcon">
          <path d={svgPaths.p3df21100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_383">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container30() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Span7() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">หัวใจและหลอดเลือด</p>
    </div>
  );
}

function Container31() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span7 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Cardiovascular)</p>
      </div>
    </div>
  );
}

function Check7() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button17() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check7 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X4() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button18() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X4 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button19() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button17 />
        <Button18 />
        <Button19 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[15.996px] relative size-full">
          <Container30 />
          <Container31 />
          <Container32 />
        </div>
      </div>
    </div>
  );
}

function Icon5() {
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

function Container34() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Span8() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">ระบบทางเดินหายใจ</p>
    </div>
  );
}

function Container35() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span8 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Respiratory)</p>
      </div>
    </div>
  );
}

function Check8() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button20() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check8 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X5() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button21() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X5 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button22() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button20 />
        <Button21 />
        <Button22 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[15.996px] relative size-full">
          <Container34 />
          <Container35 />
          <Container36 />
        </div>
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_386)" id="Icon">
          <path d={svgPaths.p2b434980} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M3.76364 8.74858H10.2341" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M4.95753 1.16648H9.0402" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_386">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container38() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Span9() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">ระบบทางเดินอาหาร</p>
    </div>
  );
}

function Container39() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span9 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(GI)</p>
      </div>
    </div>
  );
}

function Check9() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button23() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check9 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X6() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button24() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X6 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button25() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button23 />
        <Button24 />
        <Button25 />
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[15.996px] relative size-full">
          <Container38 />
          <Container39 />
          <Container40 />
        </div>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_379)" id="Icon">
          <path d={svgPaths.p314a3880} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p6afda00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_379">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container42() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Span10() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">ระบบทางเดินปัสสาวะ</p>
    </div>
  );
}

function Container43() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span10 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Urogenital)</p>
      </div>
    </div>
  );
}

function Check10() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button26() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check10 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X7() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button27() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X7 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button28() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button26 />
        <Button27 />
        <Button28 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center px-[15.996px] relative size-full">
          <Container42 />
          <Container43 />
          <Container44 />
        </div>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col gap-[0.633px] h-[247.745px] items-start overflow-clip relative shrink-0 w-[907.161px]" data-name="Container">
      <Container29 />
      <Container33 />
      <Container37 />
      <Container41 />
    </div>
  );
}

function Container25() {
  return (
    <div className="relative rounded-[14px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-px relative w-full">
          <Container26 />
          <Container28 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(16,24,40,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function GroupIcon2() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="GroupIcon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_369)" id="GroupIcon">
          <path d={svgPaths.p35690e80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_369">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Div4() {
  return (
    <div className="relative rounded-[10px] shadow-[0px_2px_6px_0px_rgba(73,138,79,0.3)] shrink-0 size-[27.995px]" data-name="div" style={{ backgroundImage: "linear-gradient(135deg, rgb(73, 138, 79) 0%, rgb(58, 112, 64) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <GroupIcon2 />
      </div>
    </div>
  );
}

function Span11() {
  return (
    <div className="absolute h-[17.49px] left-0 overflow-clip top-0 w-[143.796px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[17.5px] left-0 not-italic text-[#1e2939] text-[14px] top-[-0.17px] whitespace-nowrap">โครงสร้างและภายนอก</p>
    </div>
  );
}

function Div5() {
  return (
    <div className="h-[41.479px] relative shrink-0 w-[143.796px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span11 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">{`Structure & External · 0/4`}</p>
      </div>
    </div>
  );
}

function Button29() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[9.991px] items-center relative size-full">
        <Div4 />
        <Div5 />
      </div>
    </div>
  );
}

function Check11() {
  return (
    <div className="relative shrink-0 size-[9.991px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99131 9.99131">
        <g id="Check">
          <path d={svgPaths.p2b3c2180} id="Vector" stroke="var(--stroke-0, #498A4F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832609" />
        </g>
      </svg>
    </div>
  );
}

function Button30() {
  return (
    <div className="bg-white relative rounded-[21243700px] shrink-0" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(73,138,79,0.2)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center px-[8px] py-[2px] relative">
        <Check11 />
        <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#498a4f] text-[10px] text-center whitespace-nowrap">ปกติทุกข้อ</p>
      </div>
    </div>
  );
}

function ChevronDown2() {
  return (
    <div className="h-[15.996px] overflow-clip relative shrink-0 w-full" data-name="ChevronDown">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33099 5.33199">
            <path d={svgPaths.p146dab00} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MotionSpan2() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="motion.span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <ChevronDown2 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Button30 />
        <MotionSpan2 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="bg-[rgba(249,250,251,0.8)] content-stretch flex h-[61.461px] items-center justify-between px-[15.996px] relative shrink-0 w-[907.161px]" data-name="Container">
      <Button29 />
      <Container47 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_369)" id="GroupIcon">
          <path d={svgPaths.p35690e80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_369">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container50() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Span12() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">กระดูกและกล้ามเนื้อ</p>
    </div>
  );
}

function Container51() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span12 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Musculoskeletal)</p>
      </div>
    </div>
  );
}

function Check12() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button31() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check12 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X8() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button32() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X8 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button33() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button31 />
        <Button32 />
        <Button33 />
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[15.996px] relative size-full">
          <Container50 />
          <Container51 />
          <Container52 />
        </div>
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_355)" id="Icon">
          <path d={svgPaths.p91a0600} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p19396200} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p15fb8cc8} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p36780a80} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p26c4e3a0} id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1b24300} id="Vector_6" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p6169800} id="Vector_7" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3a6e5900} id="Vector_8" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p180c6d00} id="Vector_9" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_355">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container54() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon9 />
      </div>
    </div>
  );
}

function Span13() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">ระบบประสาท</p>
    </div>
  );
}

function Container55() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span13 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Neurological)</p>
      </div>
    </div>
  );
}

function Check13() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button34() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check13 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X9() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button35() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X9 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button36() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button34 />
        <Button35 />
        <Button36 />
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[15.996px] relative size-full">
          <Container54 />
          <Container55 />
          <Container56 />
        </div>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_350)" id="Icon">
          <path d={svgPaths.p33ddda80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1b387640} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p7222400} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_350">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container58() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon10 />
      </div>
    </div>
  );
}

function Span14() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">ผิวหนังและขน</p>
    </div>
  );
}

function Container59() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span14 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Skin/Coat)</p>
      </div>
    </div>
  );
}

function Check14() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button37() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check14 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X10() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button38() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X10 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button39() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button37 />
        <Button38 />
        <Button39 />
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[15.996px] relative size-full">
          <Container58 />
          <Container59 />
          <Container60 />
        </div>
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_64_394)" id="Icon">
          <path d={svgPaths.p3612c00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p36b36f80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3b79a000} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2b15ae80} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_64_394">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container62() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_6px_0px_rgba(245,158,11,0.3)] shrink-0 size-[27.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.01px] relative size-full">
        <Icon11 />
      </div>
    </div>
  );
}

function Span15() {
  return (
    <div className="absolute h-[17.49px] left-0 top-0 w-[642.481px]" data-name="span">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[17.5px] left-0 not-italic text-[#4a5565] text-[14px] top-[-0.17px] whitespace-nowrap">ต่อมน้ำเหลือง</p>
    </div>
  );
}

function Container63() {
  return (
    <div className="flex-[1_0_0] h-[41.479px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Span15 />
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[23.55px] whitespace-nowrap">(Lymph Nodes)</p>
      </div>
    </div>
  );
}

function Check15() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="Check">
          <path d={svgPaths.p11c3aa80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button40() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[60.086px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Check15 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[38.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ปกติ</p>
      </div>
    </div>
  );
}

function X11() {
  return (
    <div className="absolute left-[10.62px] size-[11.999px] top-[6.88px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g id="X">
          <path d={svgPaths.p355fb120} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p34c87800} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
      </svg>
    </div>
  );
}

function Button41() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[75.637px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <X11 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[46.12px] not-italic text-[#99a1af] text-[11px] text-center top-[5px] whitespace-nowrap">ผิดปกติ</p>
      </div>
    </div>
  );
}

function Button42() {
  return (
    <div className="bg-white h-[25.76px] relative rounded-[21243700px] shrink-0 w-[36.978px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[18.63px] not-italic text-[#d1d5dc] text-[11px] text-center top-[5px] whitespace-nowrap">ข้าม</p>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="h-[25.76px] relative shrink-0 w-[180.694px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-center relative size-full">
        <Button40 />
        <Button41 />
        <Button42 />
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="bg-white h-[61.461px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center px-[15.996px] relative size-full">
          <Container62 />
          <Container63 />
          <Container64 />
        </div>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col gap-[0.633px] h-[247.745px] items-start overflow-clip relative shrink-0 w-[907.161px]" data-name="Container">
      <Container49 />
      <Container53 />
      <Container57 />
      <Container61 />
    </div>
  );
}

function Container45() {
  return (
    <div className="relative rounded-[14px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-px relative w-full">
          <Container46 />
          <Container48 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(16,24,40,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[11.999px] items-start relative size-full" data-name="Container">
      <Container1 />
      <Container5 />
      <Container25 />
      <Container45 />
    </div>
  );
}