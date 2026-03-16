function Button() {
  return (
    <div className="absolute content-stretch flex h-[35.979px] items-center justify-center left-[561.85px] px-[20px] py-[8px] rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(73,138,79,0.28)] top-[16.63px] w-[165.707px]" data-name="button" style={{ backgroundImage: "linear-gradient(167.75deg, rgb(90, 158, 96) 0%, rgb(58, 125, 64) 100%)" }}>
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">บันทึกการตรวจ</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="border-[rgba(52,199,89,0.2)] border-solid border-t-[0.633px] relative size-full" data-name="Container">
      <Button />
    </div>
  );
}