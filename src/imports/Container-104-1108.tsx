import svgPaths from "./svg-sr7pderaq2";

function Icon() {
  return (
    <div className="absolute left-[16.63px] size-[15.996px] top-[10.62px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_104_1112)" id="Icon">
          <path d={svgPaths.p2c6b6000} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p351a6a60} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p35e7b00} id="Vector_3" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_104_1112">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[36px] relative rounded-[21243700px] shrink-0 w-[138px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <Icon />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[81.12px] not-italic text-[#4a5565] text-[14px] text-center top-[8.73px] whitespace-nowrap">พิมพ์ใบสั่งยา</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[16.63px] size-[15.996px] top-[10.62px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_104_1112)" id="Icon">
          <path d={svgPaths.p2c6b6000} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p351a6a60} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p35e7b00} id="Vector_3" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_104_1112">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[36px] relative rounded-[21243700px] shrink-0 w-[164px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <Icon1 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[94.12px] not-italic text-[#4a5565] text-[14px] text-center top-[8.73px] whitespace-nowrap">พิมพ์สติ๊กเกอร์ยา</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Button />
        <Button1 />
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(73,138,79,0.28)] shrink-0" data-name="button" style={{ backgroundImage: "linear-gradient(177.255deg, rgb(90, 158, 96) 6.9829%, rgb(58, 125, 64) 93.017%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[38px] py-[8px] relative">
        <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">บันทึกใบสั่งยา</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex items-start justify-between pt-[16.629px] relative size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(52,199,89,0.2)] border-solid border-t-[0.633px] inset-0 pointer-events-none" />
      <Frame />
      <Button2 />
    </div>
  );
}