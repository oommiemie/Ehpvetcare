import svgPaths from "./svg-p3pcc5pasj";

function Printer() {
  return (
    <div className="absolute left-[16.63px] size-[15.996px] top-[10.62px]" data-name="Printer">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_34_694)" id="Printer">
          <path d={svgPaths.p2c6b6000} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p351a6a60} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p35e7b00} id="Vector_3" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_34_694">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[37.245px] relative rounded-[21243700px] shrink-0 w-[136.456px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <Printer />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[80.62px] not-italic text-[#4a5565] text-[14px] text-center top-[8.73px] whitespace-nowrap">พิมพ์ใบ Visit</p>
    </div>
  );
}

function Printer1() {
  return (
    <div className="absolute left-[16.63px] size-[15.996px] top-[10.62px]" data-name="Printer">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_34_694)" id="Printer">
          <path d={svgPaths.p2c6b6000} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p351a6a60} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p35e7b00} id="Vector_3" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_34_694">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[37.245px] relative rounded-[21243700px] shrink-0 w-[202.171px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <Printer1 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[113.12px] not-italic text-[#4a5565] text-[14px] text-center top-[8.73px] whitespace-nowrap">พิมพ์ใบบันทึกการตรวจ</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <Button />
      <Button1 />
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex h-[37.245px] items-center justify-center px-[20px] py-[8px] relative rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(232,128,42,0.28)] shrink-0" data-name="button" style={{ backgroundImage: "linear-gradient(167.354deg, rgb(232, 128, 42) 0%, rgb(208, 106, 26) 100%)" }}>
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">บันทึกข้อมูลส่งตรวจ</p>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Frame />
      <Button2 />
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full">
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1080.46 1">
            <line id="Line 1" opacity="0.2" stroke="var(--stroke-0, #34C759)" x2="1080.46" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Container />
    </div>
  );
}