from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]

BG = "#f4f6f2"
PAPER = "#fbfbf8"
INK = "#102823"
MUTED = "#586661"
LINE = "#cbd7d1"
TEAL = "#123f36"
TEAL_SOFT = "#eaf4ef"
BLUE_SOFT = "#eaf2fb"
BLUE_LINE = "#5d8ed8"
ORANGE_SOFT = "#fff0e6"
ORANGE = "#f26b2d"
NAVY = "#101a2a"
ARROW = "#3f5a51"


def font_path(name):
    candidates = [
        Path("C:/Windows/Fonts") / name,
        Path("C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return str(path)
    return None


FONT = font_path("malgun.ttf")
FONT_BOLD = font_path("malgunbd.ttf")
FONT_MONO = font_path("consola.ttf")


def f(size, bold=False, mono=False):
    path = FONT_MONO if mono else (FONT_BOLD if bold else FONT)
    return ImageFont.truetype(path, size=size)


def text_size(draw, text, font):
    if not text:
        return 0, 0
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def wrap(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if text_size(draw, candidate, font)[0] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_multiline(draw, xy, text, font, fill=INK, max_width=None, line_gap=8):
    x, y = xy
    lines = text.split("\n")
    wrapped = []
    for line in lines:
        wrapped.extend(wrap(draw, line, font, max_width) if max_width else [line])
    for line in wrapped:
        draw.text((x, y), line, font=font, fill=fill)
        y += text_size(draw, line, font)[1] + line_gap
    return y


def card(draw, box, title, lines=(), fill="#ffffff", outline=LINE, title_color=INK, body_color=MUTED, code=None):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=14, fill=fill, outline=outline, width=2)
    w = x2 - x1
    h = y2 - y1
    title_size = 29
    body_size = 18
    if w < 300:
        title_size = 27
        body_size = 17
    if h < 150:
        title_size = min(title_size, 25)
        body_size = min(body_size, 16)
    if len(title.replace("\n", " ")) > 24:
        title_size = min(title_size, 25)
    title_font = f(title_size, bold=True)
    body_font = f(body_size)
    code_font = f(14 if h < 155 else 15, mono=True)
    y = y1 + (23 if h >= 150 else 19)
    y = draw_multiline(draw, (x1 + 28, y), title, title_font, fill=title_color, max_width=(x2 - x1 - 56), line_gap=3)
    y += 8
    for line in lines:
        y = draw_multiline(draw, (x1 + 28, y), line, body_font, fill=body_color, max_width=(x2 - x1 - 56), line_gap=4)
    if code:
        if y < y2 - 38:
            draw.text((x1 + 28, y2 - 31), code, font=code_font, fill=MUTED)


def arrow(draw, start, end, width=5, fill=ARROW, dashed=False):
    x1, y1 = start
    x2, y2 = end
    if dashed:
        segments = 18
        for i in range(0, segments, 2):
            sx = x1 + (x2 - x1) * i / segments
            sy = y1 + (y2 - y1) * i / segments
            ex = x1 + (x2 - x1) * (i + 1) / segments
            ey = y1 + (y2 - y1) * (i + 1) / segments
            draw.line((sx, sy, ex, ey), fill=fill, width=width)
    else:
        draw.line((x1, y1, x2, y2), fill=fill, width=width)
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    length = 22
    spread = 0.55
    p1 = (x2 - length * math.cos(angle - spread), y2 - length * math.sin(angle - spread))
    p2 = (x2 - length * math.cos(angle + spread), y2 - length * math.sin(angle + spread))
    draw.polygon([end, p1, p2], fill=fill)


def base(width, height, title, subtitle):
    image = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(image)
    margin = 70 if width >= 1800 else 55
    draw.rounded_rectangle((margin, 58, width - margin, height - 62), radius=32, fill=PAPER, outline=LINE, width=2)
    title_font = f(52 if width >= 1800 else 48, bold=True)
    subtitle_font = f(24 if width >= 1800 else 23)
    title_y = 88 if width >= 1800 else 86
    draw.text((margin + 55, title_y), title, font=title_font, fill=INK)
    subtitle_y = title_y + text_size(draw, title, title_font)[1] + 18
    draw.text((margin + 55, subtitle_y), subtitle, font=subtitle_font, fill=MUTED)
    return image, draw, margin


def footer(draw, width, height, label="Internal code paths masked"):
    draw.rectangle((0, height - 58, width, height), fill=NAVY)
    tw, th = text_size(draw, label, f(24, bold=True))
    draw.text(((width - tw) / 2, height - 41), label, font=f(24, bold=True), fill="white")


def save(image, rel):
    out = ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out, optimize=True)
    print(out)


def automation_overview():
    image, draw, _ = base(
        1800,
        1050,
        "Medical Imaging AI Automation Pipeline",
        "Sequential execution from DICOM loading to analysis, save, and reports via Action Queue and Command Pattern",
    )
    top_y = 205
    top_bottom = 390
    top_arrow_y = 298
    boxes = [
        (125, top_y, 455, top_bottom),
        (525, top_y, 875, top_bottom),
        (945, top_y, 1335, top_bottom),
        (1405, top_y, 1685, top_bottom),
    ]
    card(draw, boxes[0], "User / Schedule\nRequest", ["Macro conditions", "Analysis options / outputs"], fill=TEAL, outline=TEAL, title_color="white", body_color="white")
    card(draw, boxes[1], "Macro Flow Builder", ["Build analysis steps as Actions", "Create and register Commands"], fill=TEAL_SOFT, outline="#8ab2a7", code="ActionDeepCatchXMacro.cpp")
    card(draw, boxes[2], "ActionQueueManager", ["Push Actions into queue", "Run next task after end signal"], fill=TEAL_SOFT, outline="#8ab2a7", code="ActionQueueManager.cpp")
    card(draw, boxes[3], "Completion /\nFailure Result", ["Write logs", "Decide whether to continue"], fill=TEAL, outline=TEAL, title_color="white", body_color="white")
    for a, b in zip(boxes, boxes[1:]):
        arrow(draw, (a[2], top_arrow_y), (b[0] - 18, top_arrow_y))

    draw.text((135, 420), "Work units separated with Command Pattern", font=f(20, bold=True), fill=INK)
    steps = [
        ("1. Image Load", ["Open DICOM file", "Prepare image and metadata"]),
        ("2. Usage Check", ["Validate credit / count", "Check analysis availability"]),
        ("3. AI Request", ["Send to analysis server", "Receive result"]),
        ("4. Save Results", ["DICOM / Image Output", "Save results and annotations"]),
        ("5. Report", ["Export PDF", "Document results"]),
    ]
    step_boxes = []
    x = 125
    for title, lines in steps:
        box = (x, 465, x + 260, 620)
        step_boxes.append(box)
        card(draw, box, title, lines, fill="white", outline=LINE)
        x += 320
    for a, b in zip(step_boxes, step_boxes[1:]):
        arrow(draw, (a[2], 542), (b[0] - 18, 542))

    callouts = [
        ((125, 720, 565, 885), "Failure Flow Handling", ["Log missing files, analysis failures, and save failures", "Decide whether to continue"], "Sig_CommandEnd / Sig_ActionEnd"),
        ((680, 720, 1120, 885), "Configuration-Based Branching", ["Select command/save flow by product, module, body type, and output option"], "Config JSON / FunctionLevel"),
        ((1235, 720, 1665, 885), "Operational Impact", ["Automate repeated long-running analysis", "Trace failures and improve stability"], "Macro / Scheduler / AutoAnalysis"),
    ]
    for i, (box, title, lines, code) in enumerate(callouts):
        arrow(draw, ((step_boxes[[0, 2, 4][i]][0] + step_boxes[[0, 2, 4][i]][2]) // 2, 620), ((box[0] + box[2]) // 2, box[1] - 12), dashed=True, fill="#d97945", width=4)
        card(draw, box, title, lines, fill=ORANGE_SOFT, outline=ORANGE, code=code)
    draw.text((125, 932), "Evidence code: MedipQT/Actions/Queue, ActionQueueManager.cpp, CommandDeepCatchXPredict.cpp, CommandDeepCatchXReport.cpp", font=f(16), fill=MUTED)
    footer(draw, 1800, 1050)
    save(image, "resource/01/00_AI_Automation_Pipeline_en.png")


def repeated_analysis():
    image, draw, _ = base(
        1600,
        820,
        "Repeated Analysis Auto Execution",
        "Process multiple analysis requests sequentially and save results based on schedule conditions and output options",
    )
    top = [
        ((120, 240, 410, 385), "Collect Analysis\nConditions", ["Schedule / user request", "Analysis options and outputs"], BLUE_SOFT, BLUE_LINE),
        ((520, 240, 810, 385), "Check Execution\nAvailability", ["Credit / AI count", "Function level conditions"], TEAL_SOFT, "#76aaa0"),
        ((920, 240, 1210, 385), "Run Repeated\nAnalysis", ["Sequential Action Queue run", "Prevent duplicate busy execution"], TEAL, TEAL),
        ((1280, 240, 1500, 385), "Save Results", ["PDF / DICOM", "Image Output"], BLUE_SOFT, BLUE_LINE),
    ]
    for box, title, lines, fill, outline in top:
        card(draw, box, title, lines, fill=fill, outline=outline, title_color="white" if fill == TEAL else INK, body_color="white" if fill == TEAL else MUTED)
    for a, b in zip(top, top[1:]):
        arrow(draw, (a[0][2], 312), (b[0][0] - 18, 312))
    bottom = [
        ((260, 535, 585, 680), "Configuration-Based\nBranching", ["Build Commands by product, module, body type, and output option"], ORANGE_SOFT, ORANGE),
        ((700, 535, 1025, 680), "Failure Flow\nHandling", ["Trace missing files and analysis failures with logs and status values"], ORANGE_SOFT, ORANGE),
        ((1140, 535, 1460, 680), "Operational Impact", ["Automate repeated long-running analysis", "Improve failure traceability"], TEAL_SOFT, "#76aaa0"),
    ]
    for idx, item in zip([1, 2, 3], bottom):
        src = top[idx][0]
        box = item[0]
        arrow(draw, ((src[0] + src[2]) // 2, src[3]), ((box[0] + box[2]) // 2, box[1] - 12))
    for box, title, lines, fill, outline in bottom:
        card(draw, box, title, lines, fill=fill, outline=outline)
    save(image, "resource/01/02_Repeated_Analysis_Auto_Run_en.png")


def action_queue():
    image, draw, _ = base(
        1600,
        820,
        "Action Queue Execution State",
        "Queue user requests and control the next task based on busy, cancel, and fail states",
    )
    outer = (125, 250, 1475, 430)
    draw.rounded_rectangle(outer, radius=26, fill="#f6fbf9", outline=LINE, width=2)
    draw.text((160, 305), "Queue", font=f(24, bold=True), fill=INK)
    flow = [
        ((270, 295, 470, 405), "Waiting", ["Action registered"], BLUE_SOFT, BLUE_LINE),
        ((550, 295, 750, 405), "Running", ["busy state"], TEAL, TEAL),
        ((830, 295, 1030, 405), "Completed", ["end signal"], TEAL_SOFT, "#76aaa0"),
        ((1110, 295, 1310, 405), "Next Task", ["Sequential run"], BLUE_SOFT, BLUE_LINE),
    ]
    for box, title, lines, fill, outline in flow:
        card(draw, box, title, lines, fill=fill, outline=outline, title_color="white" if fill == TEAL else INK, body_color="white" if fill == TEAL else MUTED)
    for a, b in zip(flow, flow[1:]):
        arrow(draw, (a[0][2], 350), (b[0][0] - 18, 350))
    callouts = [
        ((195, 520, 500, 660), "Cancel Handling", ["User cancel signal", "Clean current work before exit"], ORANGE_SOFT, ORANGE),
        ((535, 520, 840, 660), "Fail Handling", ["Record analysis/save failures", "Preserve failure-point logs"], ORANGE_SOFT, ORANGE),
        ((1105, 520, 1410, 660), "Operational Stability", ["Long-running repeated execution", "State-based next task decision"], TEAL_SOFT, "#76aaa0"),
    ]
    for src_idx, item in zip([1, 1, 2], callouts):
        src = flow[src_idx][0]
        box = item[0]
        arrow(draw, ((src[0] + src[2]) // 2, src[3]), ((box[0] + box[2]) // 2, box[1] - 12))
    for box, title, lines, fill, outline in callouts:
        card(draw, box, title, lines, fill=fill, outline=outline)
    draw.text((120, 725), "Key: Stabilize repeated analysis flows by preventing duplicate execution and preserving failure state.", font=f(18), fill=MUTED)
    save(image, "resource/01/04_Action_Queue_Status_en.png")


def report_output():
    image, draw, _ = base(
        1800,
        1050,
        "AI Analysis Report Output",
        "Output flow from DICOM/AI results to HTML reports, PDF, CSV, and PACS upload",
    )
    top = [
        ((125, 230, 435, 405), "Input Data", ["DICOM metadata", "AI result JSON", "segmentation / image"], "white", LINE),
        ((500, 230, 860, 405), "Select Report\nConditions", ["Product/module/license conditions", "Language/country/body type", "Show/Save/Upload ID branches"], BLUE_SOFT, BLUE_LINE),
        ((920, 230, 1285, 405), "Render HTML\nReport", ["QWebEngine screen composition", "Apply data.json / img / memo", "Connect PDF output"], BLUE_SOFT, BLUE_LINE),
        ((1345, 230, 1655, 405), "Output Results", ["PDF Report", "CSV Export", "PACS Upload"], TEAL, TEAL),
    ]
    for box, title, lines, fill, outline in top:
        card(draw, box, title, lines, fill=fill, outline=outline, title_color="white" if fill == TEAL else INK, body_color="white" if fill == TEAL else MUTED)
    for a, b in zip(top, top[1:]):
        arrow(draw, (a[0][2], 318), (b[0][0] - 18, 318))
    bottom = [
        ((125, 545, 435, 705), "PDF Generation", ["Print HTML screen to PDF", "Stabilize save flow signals"], ORANGE_SOFT, ORANGE),
        ((920, 545, 1285, 725), "Institution-Specific\nException Handling", ["Patient name special characters", "Date conditions", "Language-specific output rules"], ORANGE_SOFT, ORANGE),
        ((1345, 545, 1655, 705), "PACS Upload", ["Connect automatic upload flow", "Organize CSV/external system paths"], ORANGE_SOFT, ORANGE),
    ]
    for idx, item in zip([0, 2, 3], bottom):
        src = top[idx][0]
        box = item[0]
        arrow(draw, ((src[0] + src[2]) // 2, src[3]), ((box[0] + box[2]) // 2, box[1] - 12))
    for box, title, lines, fill, outline in bottom:
        card(draw, box, title, lines, fill=fill, outline=outline)
    draw.rounded_rectangle((170, 790, 1630, 895), radius=14, fill="white", outline=LINE, width=2)
    draw.text((205, 828), "Key Usage Point", font=f(28, bold=True), fill=INK)
    draw.text((490, 822), "Collect report conditions in ReportViewLoader and separate outputs by QWebEngine / PACS / CSV.", font=f(20), fill=INK)
    draw.text((125, 948), "Evidence code: System/ReportViewLoader.cpp, UI/ReportView.cpp, Windows/ReportWidgetWebEnginView.cpp, MedipQT.cpp::OnMenuUploadToPACS", font=f(15), fill=MUTED)
    footer(draw, 1800, 1050)
    save(image, "resource/02/00_AI_Report_Output_en.png")


def dicom_upload():
    image, draw, _ = base(
        1800,
        1050,
        "PDF/Image DICOM Conversion and PACS Upload Flow",
        "Convert PDF documents and image results into DICOM datasets and send them to PACS via C-STORE",
    )
    top = [
        ((125, 230, 425, 400), "Input Source", ["Local PDF file", "QTextDocument preview", "QImage / image series"], TEAL, TEAL),
        ((500, 230, 840, 400), "Enrich DICOM\nTags", ["Patient name and ID", "Study description, date/time"], TEAL_SOFT, "#76aaa0"),
        ((915, 230, 1305, 400), "DicomConverter", ["PDF/Image conversion facade", "Temporary PDF/BMP path management"], BLUE_SOFT, BLUE_LINE),
        ((1380, 230, 1660, 400), "DICOM Result", ["temp_dcm.dcm", "DicomDataset", "PACS upload target"], TEAL, TEAL),
    ]
    for box, title, lines, fill, outline in top:
        card(draw, box, title, lines, fill=fill, outline=outline, title_color="white" if fill == TEAL else INK, body_color="white" if fill == TEAL else MUTED)
    for a, b in zip(top, top[1:]):
        arrow(draw, (a[0][2], 315), (b[0][0] - 18, 315))
    draw.text((135, 445), "Conversion Paths", font=f(24, bold=True), fill=INK)
    mid = [
        ((125, 480, 595, 650), "PDF -> Encapsulated DICOM", ["Embed PDF as DcmEncapsulatedDocument", "Create identifier/header and validate transfer syntax"], "PdfToDcmConverter.cpp"),
        ((665, 480, 1135, 650), "Image -> Secondary Capture", ["Save QImage as temporary BMP", "Convert image pixels to DICOM Dataset", "Save with Study/Series metadata"], "ImageToDcmConverter.cpp"),
        ((1205, 480, 1665, 650), "Merge Export Data", ["Collect PDF documents, PDF files, and image series into Dataset", "Organize Series/Instance UID and time tags"], "DicomExportManager.cpp"),
    ]
    for box, title, lines, code in mid:
        card(draw, box, title, lines, fill="white", outline=LINE, code=code)
        arrow(draw, (1110, 400), ((box[0] + box[2]) // 2, box[1] - 15), dashed=True, fill="#df8b56")
    bottom = [
        ((125, 705, 585, 875), "Operational Usage", ["Create PACS-accepted DICOM for reports and image results", "Separate institution-specific PACS settings"], "PACSConfig / DicomHostInfo"),
        ((672, 705, 1152, 875), "File Save and Debug Backup", ["Save ExportToFile as SOPInstanceUID.dcm", "Backup debug mode output to Report_DICOM path"], "DicomExportManager.cpp"),
        ((1216, 705, 1665, 875), "PACS C-STORE Send", ["Set store target with PACSConfig Export Host", "Run StoreSCUCommand from upload flow"], "DicomNetworkManager.cpp / StoreSCUCommand.cpp"),
    ]
    for box, title, lines, code in bottom:
        card(draw, box, title, lines, fill=ORANGE_SOFT, outline=ORANGE, code=code)
    draw.text((125, 948), "Evidence code: PACSDicomConvertUploadWidget.cpp, DicomConverter.cpp, PdfToDcmConverter.cpp, ImageToDcmConverter.cpp, DicomExportManager.cpp, StoreSCUCommand.cpp", font=f(15), fill=MUTED)
    footer(draw, 1800, 1050)
    save(image, "resource/03/01_PDF_PACS_DICOM_Upload_Flow_en.png")


def stabilization():
    image, draw, _ = base(
        1600,
        850,
        "Product Stabilization and Operational Validation",
        "Reduce product operation risk through repeated pre-release validation and execution condition checks",
    )
    center = (560, 310, 1040, 455)
    nodes = [
        ((130, 235, 470, 370), "UI AutoTest", ["Check repeated UI behavior", "Organize log-based reproduction conditions"], BLUE_SOFT, BLUE_LINE),
        ((130, 445, 470, 580), "Credit / AI Count", ["Check usage before execution", "Check blocking conditions on failure"], TEAL_SOFT, "#76aaa0"),
        ((1125, 235, 1470, 370), "Function Level", ["Segment product features", "Separate features by license condition"], BLUE_SOFT, BLUE_LINE),
        ((1125, 445, 1470, 580), "Report Generation", ["Generate reports by module", "Verify output quality and missing items"], TEAL_SOFT, "#76aaa0"),
        ((430, 610, 760, 745), "Release Check", ["Prepare validation documents", "Check before RC/Hotfix"], ORANGE_SOFT, ORANGE),
        ((840, 610, 1170, 755), "Operational Issue\nResponse", ["Record failure flows/states", "Define reproduction criteria"], ORANGE_SOFT, ORANGE),
    ]
    center_point = ((center[0] + center[2]) // 2, (center[1] + center[3]) // 2)
    for box, title, lines, fill, outline in nodes:
        arrow(draw, ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2), center_point, width=4)
    card(draw, center, "Stabilization\nCriteria", ["Connect feature conditions, execution results, and pre-release check items"], fill=TEAL, outline=TEAL, title_color="white", body_color="white")
    for box, title, lines, fill, outline in nodes:
        card(draw, box, title, lines, fill=fill, outline=outline)
    save(image, "resource/04/00_Product_Stabilization_Checks_en.png")


def validation_report():
    width, height = 562, 825
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    draw.rectangle((18, 20, 542, 80), outline="#999999", width=1)
    draw.line((135, 20, 135, 80), fill="#999999", width=1)
    draw.line((368, 20, 368, 80), fill="#999999", width=1)
    draw.text((45, 38), "MEDICAL IP", font=f(11), fill="#9bb7cc")
    draw.text((164, 31), "Software Validation Report", font=f(13, bold=True), fill="#777777")
    draw.text((209, 61), "DeepCatch X", font=f(13, bold=True), fill="#777777")
    draw.rectangle((368, 20, 542, 80), fill=NAVY)
    draw.text((382, 33), "Document No.\nMasked", font=f(18, bold=True), fill="white")
    draw.rectangle((20, 118, 540, 198), fill="#dddddd", outline="#111111", width=1)
    draw.text((76, 150), "Software Validation Report (SVR)", font=f(28, bold=True), fill="black")
    draw.line((76, 181, 486, 181), fill="black", width=1)
    draw.rectangle((20, 398, 540, 454), outline="#111111", width=1)
    rows = [("Classification Name", "Cardiovascular image, analysis software, class 2"), ("Model Name", "DeepCatch X"), ("Version", "Ver. 1.0.0")]
    y = 398
    for label, value in rows:
        draw.line((20, y + 18, 540, y + 18), fill="#111111", width=1)
        draw.line((150, y, 150, y + 18), fill="#111111", width=1)
        draw.text((26, y + 2), label, font=f(9, bold=True), fill="black")
        draw.text((156, y + 2), value, font=f(9, bold=True), fill="black")
        y += 18
    draw.rectangle((20, 504, 542, 668), outline="#111111", width=1)
    draw.rectangle((20, 504, 253, 668), fill="#e3e3e3", outline="#111111", width=1)
    draw.line((102, 504, 102, 668), fill="#111111", width=1)
    for yy in [526, 547, 568, 598]:
        draw.line((20, yy, 253, yy), fill="#111111", width=1)
    labels = ["Name", "Position", "Date", "Signature"]
    values = ["Prepared by", "JaeSung Han", "R&D Manager", "24.03.08"]
    for i, label in enumerate(labels):
        draw.text((45, 510 + i * 21), label, font=f(8, bold=True), fill="black")
    for i, value in enumerate(values):
        draw.text((150, 510 + i * 18), value, font=f(8, bold=True), fill="#0060b8")
    draw.line((145, 635, 190, 620), fill="black", width=2)
    draw.line((190, 620, 204, 642), fill="black", width=2)
    draw.rectangle((253, 504, 542, 668), fill=NAVY)
    draw.text((278, 556), "Reviewer / Approver\nInformation Masked", font=f(26, bold=True), fill="white")
    draw.text((240, 695), "MEDICAL IP", font=f(16), fill="#468cc7")
    draw.rectangle((0, 780, width, height), fill=NAVY)
    draw.text((202, 796), "Company Name Masked", font=f(16, bold=True), fill="white")
    save(image, "resource/04/03_DeepCatch_X_Validation_en.png")


def test_automation():
    image, draw, _ = base(
        1600,
        850,
        "Test Automation Infrastructure",
        "Replay UI AutoTest settings and logs to run long-duration repeated validation and record failure points",
    )
    top = [
        ((105, 225, 345, 395), "Load Test\nSettings", ["Repeat count", "Start point", "Macro file path"], BLUE_SOFT, BLUE_LINE),
        ((392, 225, 632, 395), "Replay UI Logs", ["Object/event type", "Keyboard/mouse replay"], TEAL_SOFT, "#76aaa0"),
        ((680, 225, 920, 395), "Control Repeated\nExecution", ["Loop by set unit", "Pass/fail progress"], TEAL, TEAL),
        ((968, 225, 1208, 395), "Wait for Work\nCompletion", ["Check Action/Progress", "Continue after popup"], TEAL_SOFT, "#76aaa0"),
        ((1255, 225, 1495, 395), "Save Results", ["Result CSV", "Success/Failed CSV"], BLUE_SOFT, BLUE_LINE),
    ]
    for box, title, lines, fill, outline in top:
        card(draw, box, title, lines, fill=fill, outline=outline, title_color="white" if fill == TEAL else INK, body_color="white" if fill == TEAL else MUTED)
    for a, b in zip(top, top[1:]):
        arrow(draw, (a[0][2], 310), (b[0][0] - 18, 310))
    bottom = [
        ((90, 495, 360, 660), "Restart Criteria", ["Record last task number", "Trace failure section with CrashTask"], "RecordLastTask"),
        ((665, 495, 935, 660), "Prevent Duplicate\nExecution", ["Check lock and busy state", "Block early next input"], "WaitingTime"),
        ((955, 495, 1225, 660), "Wait for PACS Auto\nAnalysis", ["Monitor PACS run state", "Continue after completion"], "WaitAutoPacsAnalysis"),
        ((1242, 495, 1512, 660), "Validation Results", ["CSV results by test case", "Organize repeated failures"], "saveModelToFile"),
    ]
    for idx, item in zip([0, 2, 3, 4], bottom):
        src = top[idx][0]
        box = item[0]
        arrow(draw, ((src[0] + src[2]) // 2, src[3]), ((box[0] + box[2]) // 2, box[1] - 12))
    for box, title, lines, code in bottom:
        card(draw, box, title, lines, fill=ORANGE_SOFT, outline=ORANGE, code=code)
    draw.rounded_rectangle((170, 685, 1430, 745), radius=14, fill="white", outline=LINE, width=2)
    draw.text((220, 703), "Key Usage Point", font=f(25, bold=True), fill=INK)
    draw.text((470, 700), "Turn manual click logs into reusable test cases and preserve failure locations/results for operations.", font=f(18), fill=INK)
    draw.text((95, 765), "Evidence code: UIAutoTest/Logger.*, UIAutoTest/AutoTester.*, UIAutoTest/AutoThread.*, UIAutoTest/AutoTestSetting.*, Actions/Queue/ActionDeepCatchXScheduler.*", font=f(14), fill=MUTED)
    footer(draw, 1600, 850)
    save(image, "resource/05/00_Test_Automation_Infrastructure_en.png")


def medip_macro_overview(language="ko"):
    is_ko = language == "ko"
    title = "MEDIP 배치 분석·결과 Export Macro" if is_ko else "MEDIP Batch Analysis and Export Macro"
    subtitle = (
        "다수의 DICOM·MIP 입력을 파일별 Action과 세부 Command로 순차 처리"
        if is_ko
        else "Process multiple DICOM and MIP inputs through per-file Actions and detailed Commands"
    )
    image, draw, _ = base(1800, 1050, title, subtitle)

    top_data = [
        (
            "입력·설정" if is_ko else "Input and Setup",
            ["DICOM·MIP 파일/폴더", "복수 AI·Export 옵션", "JSON 저장·불러오기"]
            if is_ko
            else ["DICOM/MIP files or folders", "Multiple AI and export options", "Save/load JSON settings"],
        ),
        (
            "파일별 Action 구성" if is_ko else "Per-file Action",
            ["각 입력을 독립 작업으로 구성", "세부 단계를 Command로 분리"]
            if is_ko
            else ["Model each input independently", "Split stages into Commands"],
        ),
        (
            "Action Queue 실행" if is_ko else "Action Queue Execution",
            ["파일별 순차 실행", "현재 작업 상태·취소 처리"]
            if is_ko
            else ["Sequential per-file execution", "Status and cancellation handling"],
        ),
        (
            "결과·상태 기록" if is_ko else "Results and Status",
            ["다양한 결과 형식 저장", "JSONL 상태·실패 메시지"]
            if is_ko
            else ["Save multiple output formats", "JSONL states and failure messages"],
        ),
    ]
    top_boxes = [
        (120, 220, 460, 405),
        (540, 220, 880, 405),
        (960, 220, 1300, 405),
        (1380, 220, 1680, 405),
    ]
    for index, (box, data) in enumerate(zip(top_boxes, top_data)):
        fill = TEAL if index in {0, 3} else TEAL_SOFT
        card(
            draw,
            box,
            data[0],
            data[1],
            fill=fill,
            outline=TEAL if fill == TEAL else "#76aaa0",
            title_color="white" if fill == TEAL else INK,
            body_color="white" if fill == TEAL else MUTED,
        )
    for left, right in zip(top_boxes, top_boxes[1:]):
        arrow(draw, (left[2], 312), (right[0] - 18, 312))

    draw.text(
        (125, 445),
        "Command 단위 실행 흐름" if is_ko else "Command-level execution flow",
        font=f(21, bold=True),
        fill=INK,
    )
    command_data = [
        ("1. DICOM Load", ["영상·메타데이터 준비"] if is_ko else ["Prepare image and metadata"]),
        ("2. AI Predict", ["복수 Segmentation 순차 실행"] if is_ko else ["Run multiple segmentations"]),
        ("3. Preview Surface", ["Mask 기반 Surface 생성"] if is_ko else ["Create surfaces from masks"]),
        ("4. Layer·Mesh Export", ["NII·RAW·STL·OBJ", "Smooth 방식·선택 규칙"] if is_ko else ["NII, RAW, STL, OBJ", "Smoothing and name rules"]),
        ("5. Medical Outputs", ["HU Volume NII·MIP·CSV"] if is_ko else ["HU volume NII, MIP, CSV"]),
    ]
    command_boxes = []
    x = 120
    for command_title, command_lines in command_data:
        box = (x, 490, x + 280, 650)
        command_boxes.append(box)
        card(draw, box, command_title, command_lines, fill="white", outline=LINE)
        x += 330
    for left, right in zip(command_boxes, command_boxes[1:]):
        arrow(draw, (left[2], 570), (right[0] - 18, 570))

    callouts = [
        (
            (120, 745, 570, 905),
            "파일별 실패 격리" if is_ko else "Per-file Failure Isolation",
            ["현재 파일 실패 후 다음 파일 계속 실행", "전체 배치 중단 방지"]
            if is_ko
            else ["Continue with the next file after failure", "Prevent whole-batch interruption"],
            "ActionMedipMacro",
        ),
        (
            (675, 745, 1125, 905),
            "상태·원인 추적" if is_ko else "Status and Cause Tracking",
            ["NotStarted·Running·Success", "Failed·Interrupted·실패 메시지"]
            if is_ko
            else ["NotStarted, Running, Success", "Failed, Interrupted, error messages"],
            "JSONL",
        ),
        (
            (1230, 745, 1680, 905),
            "실행 안정성" if is_ko else "Execution Stability",
            ["결과 폴더 중복 방지", "종료 방지·취소·UI 복원"]
            if is_ko
            else ["Collision-free result folders", "Close prevention, cancel, UI restore"],
            "MedipMacroDlg",
        ),
    ]
    for box, callout_title, lines, code in callouts:
        card(draw, box, callout_title, lines, fill=ORANGE_SOFT, outline=ORANGE, code=code)

    footer(draw, 1800, 1050, "내부 코드 경로 마스킹" if is_ko else "Internal code paths masked")
    save(
        image,
        "resource/01/00_MEDIP_Macro_Batch.png"
        if is_ko
        else "resource/01/00_MEDIP_Macro_Batch_en.png",
    )


def pacs_stabilization_overview(language="ko"):
    is_ko = language == "ko"
    title = "기존 DICOM/PACS 안정화와 C-ECHO 추가" if is_ko else "Existing DICOM/PACS Stabilization and C-ECHO"
    subtitle = (
        "신규 구축이 아닌 기존 Query/Retrieve·송수신 흐름의 운영 이슈 수정과 연결 확인"
        if is_ko
        else "Maintain existing Query/Retrieve and transfer flows, fix operational issues, and add connectivity checks"
    )
    image, draw, _ = base(1800, 1050, title, subtitle)

    top_data = [
        (
            "기존 PACS 코드" if is_ko else "Existing PACS Code",
            ["Query/Retrieve", "검색·다운로드·송수신"] if is_ko else ["Query/Retrieve", "Search, download, transfer"],
        ),
        (
            "문제 재현" if is_ko else "Issue Reproduction",
            ["기관별 설정·로그 확인", "포트·Busy·응답 상태 분석"]
            if is_ko
            else ["Inspect settings and logs", "Analyze port, busy, response states"],
        ),
        (
            "운영 이슈 수정" if is_ko else "Operational Fixes",
            ["검색·다운로드 오류 개선", "상태·예외 처리 보강"]
            if is_ko
            else ["Fix search/download defects", "Strengthen state and exceptions"],
        ),
        (
            "DICOM C-ECHO" if is_ko else "DICOM C-ECHO",
            ["설정 화면 비동기 실행", "서버 연결 가능 여부 표시"]
            if is_ko
            else ["Asynchronous settings action", "Display connectivity result"],
        ),
    ]
    top_boxes = [
        (120, 225, 460, 410),
        (540, 225, 880, 410),
        (960, 225, 1300, 410),
        (1380, 225, 1680, 410),
    ]
    for index, (box, data) in enumerate(zip(top_boxes, top_data)):
        fill = TEAL if index in {0, 3} else TEAL_SOFT
        card(
            draw,
            box,
            data[0],
            data[1],
            fill=fill,
            outline=TEAL if fill == TEAL else "#76aaa0",
            title_color="white" if fill == TEAL else INK,
            body_color="white" if fill == TEAL else MUTED,
        )
    for left, right in zip(top_boxes, top_boxes[1:]):
        arrow(draw, (left[2], 317), (right[0] - 18, 317))

    scope_title = "담당 범위" if is_ko else "Ownership Scope"
    scope_body = (
        "기존 연동 구조를 유지하며 오류 수정과 연결 확인 기능 추가에 집중"
        if is_ko
        else "Focused on defect fixes and connectivity checks while preserving the existing integration architecture"
    )
    draw.rounded_rectangle((170, 470, 1630, 570), radius=18, fill="#ffffff", outline=BLUE_LINE, width=3)
    draw.text((220, 495), scope_title, font=f(28, bold=True), fill=INK)
    scope_body_x = 440 if is_ko else 500
    draw.text((scope_body_x, 498), scope_body, font=f(22), fill=INK)

    bottom_data = [
        (
            (120, 680, 570, 865),
            "검색·다운로드 안정화" if is_ko else "Search and Download Stability",
            ["기존 Query/Retrieve 흐름 분석", "기관별 오류와 상태 처리 개선"]
            if is_ko
            else ["Analyze existing Query/Retrieve", "Fix institution-specific state issues"],
            "Maintenance",
        ),
        (
            (675, 680, 1125, 865),
            "연결 확인 기능" if is_ko else "Connectivity Check",
            ["PACS 설정과 Network Manager 연동", "비동기 C-ECHO 결과 표시"]
            if is_ko
            else ["Connect settings and Network Manager", "Show asynchronous C-ECHO result"],
            "DCMTK C-ECHO",
        ),
        (
            (1230, 680, 1680, 865),
            "운영 신뢰성" if is_ko else "Operational Reliability",
            ["로그·재현 조건 기반 원인 분석", "Busy·포트·응답 예외 보강"]
            if is_ko
            else ["Diagnose with logs and reproduction", "Improve busy, port, response handling"],
            "State Handling",
        ),
    ]
    for box, bottom_title, lines, code in bottom_data:
        card(draw, box, bottom_title, lines, fill=ORANGE_SOFT, outline=ORANGE, code=code)

    footer(draw, 1800, 1050, "신규 Query/Retrieve 구축 아님" if is_ko else "Query/Retrieve was not built from scratch")
    save(
        image,
        "resource/03/00_PACS_Stabilization.png"
        if is_ko
        else "resource/03/00_PACS_Stabilization_en.png",
    )


def system_integration_overview(language="ko"):
    is_ko = language == "ko"
    title = "TCP/IP·Serial 장비·외부 소프트웨어 연동" if is_ko else "TCP/IP and Serial Equipment Integration"
    subtitle = (
        "테스트 애플리케이션과 통합 제어 프로그램에서 명령·응답, 상태와 통신 예외 처리"
        if is_ko
        else "Command/response, state, and communication-exception handling across test and control software"
    )
    image, draw, _ = base(1800, 1050, title, subtitle)

    top_data = [
        (
            "Python/Qt 테스트 앱" if is_ko else "Python/Qt Test App",
            ["테스트 명령 생성", "장비·SW 상태 확인"] if is_ko else ["Create test commands", "Monitor equipment/software"],
        ),
        (
            "TCP/IP·Serial" if is_ko else "TCP/IP and Serial",
            ["명령 전송·응답 수신", "연결 상태 확인"] if is_ko else ["Send commands and receive responses", "Track connection state"],
        ),
        (
            "AMX 통합 제어" if is_ko else "AMX Integrated Control",
            ["외부 장비 제어 흐름", "WATCHOUT 프로토콜 연동"]
            if is_ko
            else ["External equipment control", "WATCHOUT protocol integration"],
        ),
        (
            "장비·외부 소프트웨어" if is_ko else "Equipment and External Software",
            ["동작 결과·상태 반환", "오류·연결 해제 처리"]
            if is_ko
            else ["Return operation results and state", "Handle errors and disconnects"],
        ),
    ]
    top_boxes = [
        (105, 235, 465, 430),
        (535, 235, 895, 430),
        (965, 235, 1325, 430),
        (1395, 235, 1695, 430),
    ]
    for index, (box, data) in enumerate(zip(top_boxes, top_data)):
        fill = TEAL if index in {0, 3} else TEAL_SOFT
        card(
            draw,
            box,
            data[0],
            data[1],
            fill=fill,
            outline=TEAL if fill == TEAL else "#76aaa0",
            title_color="white" if fill == TEAL else INK,
            body_color="white" if fill == TEAL else MUTED,
        )
    for left, right in zip(top_boxes, top_boxes[1:]):
        arrow(draw, (left[2], 332), (right[0] - 18, 332))

    bottom_data = [
        (
            (120, 650, 570, 855),
            "명령·응답 흐름" if is_ko else "Command and Response",
            ["요청 형식과 응답 결과 처리", "장비·프로그램 간 동작 순서 제어"]
            if is_ko
            else ["Process request and response formats", "Control cross-system operation order"],
            "TCP/IP · Serial",
        ),
        (
            (675, 650, 1125, 855),
            "연결·상태 관리" if is_ko else "Connection and State",
            ["연결 여부와 장비 상태 확인", "외부 입력과 동작 결과 동기화"]
            if is_ko
            else ["Monitor connections and equipment state", "Synchronize inputs and results"],
            "State Handling",
        ),
        (
            (1230, 650, 1680, 855),
            "통신 예외 처리" if is_ko else "Communication Exceptions",
            ["응답 지연·연결 해제 대응", "장비·소프트웨어 경계 문제 추적"]
            if is_ko
            else ["Handle delayed responses and disconnects", "Trace hardware/software boundary issues"],
            "WATCHOUT",
        ),
    ]
    for box, bottom_title, lines, code in bottom_data:
        card(draw, box, bottom_title, lines, fill=ORANGE_SOFT, outline=ORANGE, code=code)

    footer(draw, 1800, 1050, "경력 기술 기반 구성" if is_ko else "Structured from verified work history")
    save(
        image,
        "resource/06/00_시스템_연동_흐름.png"
        if is_ko
        else "resource/06/00_System_Integration_Flow_en.png",
    )


def main():
    stabilization()
    validation_report()
    test_automation()
    pacs_stabilization_overview("ko")
    pacs_stabilization_overview("en")


if __name__ == "__main__":
    main()
