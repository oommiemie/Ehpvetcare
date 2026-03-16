function Button() {
  return (
    <div className="bg-[#498a4f] content-stretch flex items-center justify-center px-[20px] py-[8px] relative rounded-[21243700px] shrink-0 w-[90px]" data-name="button">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">รายวัน</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex items-center justify-center px-[20px] py-[8px] relative rounded-[21243700px] shrink-0 w-[90px]" data-name="button">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#6a7282] text-[12px] text-center whitespace-nowrap">รายสัปดาห์</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex items-center justify-center px-[20px] py-[8px] relative rounded-[21243700px] shrink-0 w-[90px]" data-name="button">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#6a7282] text-[12px] text-center whitespace-nowrap">รายเดือน</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(255,255,255,0.9)] content-stretch flex items-center overflow-clip p-[4px] relative rounded-[21243700px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] size-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}