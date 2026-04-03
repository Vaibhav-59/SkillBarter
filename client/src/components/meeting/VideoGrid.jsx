import VideoCard from "./VideoCard";

/**
 * Returns CSS grid layout rules.
 * Uses grid-auto-rows with a minmax() to guarantee cards never shrink
 * below a viewable threshold (e.g. 280px height), resolving cramped visuals.
 */
function getGridStyle(total) {
  if (total === 1) return { gridTemplateColumns: "1fr" };
  if (total === 2) return { gridTemplateColumns: "1fr 1fr" };
  if (total <= 4)  return { gridTemplateColumns: "1fr 1fr", gridAutoRows: "minmax(280px, 1fr)" };
  if (total <= 6)  return { gridTemplateColumns: "1fr 1fr 1fr", gridAutoRows: "minmax(260px, 1fr)" };
  return { gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gridAutoRows: "minmax(260px, 1fr)" };
}

/**
 * VideoGrid — handles all three layout modes:
 *  1. Local screen share  → big main tile + sidebar strip
 *  2. Remote screen share → featured tile + sidebar strip
 *  3. Normal tiled grid   → responsive CSS grid
 */
export default function VideoGrid({
  localStream,
  localName,
  isMuted,
  isCamOff,
  isScreenSharing,
  screenStream,
  remoteParticipants,
}) {
  const remoteSharer = remoteParticipants.find((p) => p.isScreenSharing);

  const allCamTiles = [
    {
      key: "local",
      stream: localStream,
      name: localName,
      isMuted,
      isCamOff: isScreenSharing ? false : isCamOff,
      isLocal: true,
      isScreenShare: false,
    },
    ...remoteParticipants.map((p) => ({
      key: p.socketId,
      stream: p.stream || null,
      name: p.userName,
      isMuted: p.isMuted || false,
      isCamOff: p.isScreenSharing ? false : (
        p.isCamOff !== undefined
          ? p.isCamOff
          : (!p.stream || p.stream.getVideoTracks().length === 0)
      ),
      isLocal: false,
      isScreenShare: p.isScreenSharing || false,
    })),
  ];

  const sidebarStyle = {
    width: "14rem",
    flexShrink: 0,
  };

  // ── Layout 1: Local user sharing screen ──────────────────────────────────
  if (isScreenSharing && screenStream) {
    return (
      <div className="w-full h-full flex gap-3 p-3 overflow-hidden">
        <div className="flex-[4] min-w-0 min-h-0">
          <VideoCard
            stream={screenStream}
            name={localName}
            isMuted={false}
            isCamOff={false}
            isLocal={false}
            isScreenShare
          />
        </div>
        <div
          className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden"
          style={sidebarStyle}
        >
          {allCamTiles.map((t) => (
            <div key={t.key} className="flex-shrink-0" style={{ aspectRatio: "16/9" }}>
              <VideoCard
                stream={t.stream}
                name={t.name}
                isMuted={t.isMuted}
                isCamOff={t.isCamOff}
                isLocal={t.isLocal}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Layout 2: Remote participant sharing screen ───────────────────────────
  if (remoteSharer) {
    const sideTiles = allCamTiles.filter((t) => t.key !== remoteSharer.socketId);

    return (
      <div className="w-full h-full flex gap-3 p-3 overflow-hidden">
        <div className="flex-[4] min-w-0 min-h-0">
          <VideoCard
            stream={remoteSharer.stream}
            name={remoteSharer.userName}
            isMuted={remoteSharer.isMuted || false}
            isCamOff={false}
            isLocal={false}
            isScreenShare
          />
        </div>
        <div
          className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden"
          style={sidebarStyle}
        >
          {sideTiles.map((t) => (
            <div key={t.key} className="flex-shrink-0" style={{ aspectRatio: "16/9" }}>
              <VideoCard
                stream={t.stream}
                name={t.name}
                isMuted={t.isMuted}
                isCamOff={t.isCamOff}
                isLocal={t.isLocal}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Layout 3: Normal tiled grid ───────────────────────────────────────────
  const total = allCamTiles.length;
  const gridStyle = getGridStyle(total);

  return (
    <div
      className="w-full h-full p-3 overflow-y-auto overflow-x-hidden custom-scrollbar"
      style={{
        display: "grid",
        gap: "12px",
        alignContent: "start",
        ...gridStyle,
      }}
    >
      {allCamTiles.map((t) => (
        <VideoCard
          key={t.key}
          stream={t.stream}
          name={t.name}
          isMuted={t.isMuted}
          isCamOff={t.isCamOff}
          isLocal={t.isLocal}
          isScreenShare={t.isScreenShare}
        />
      ))}
    </div>
  );
}
