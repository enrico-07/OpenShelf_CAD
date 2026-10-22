import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#718096"))
            self.drawString(54, letter[1] - 36, "OpenShelf — AWS Cloud Services Architecture & Integration Brief")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
            
        # Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#718096"))
        self.drawString(54, 36, "OpenShelf v1.0.0 • Confidential / Academic Project Documentation")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, page_str)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, letter[0] - 54, 48)
        
        self.restoreState()

def create_pdf(filename="OpenShelf_AWS_Cloud_Architecture_Brief.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom palette
    PRIMARY = colors.HexColor("#0F172A")    # Deep Navy Slate
    ACCENT = colors.HexColor("#0D9488")     # Emerald Teal
    ACCENT_DARK = colors.HexColor("#115E59")
    TEXT_DARK = colors.HexColor("#1E293B")
    TEXT_MUTED = colors.HexColor("#64748B")
    BG_LIGHT = colors.HexColor("#F8FAFC")
    BORDER_LIGHT = colors.HexColor("#CBD5E1")

    # Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=ACCENT_DARK,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=ACCENT_DARK,
        spaceBefore=8,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK,
        leftIndent=14,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_DARK
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=PRIMARY
    )

    story = []

    # Title & Header Banner
    story.append(Paragraph("OpenShelf", title_style))
    story.append(Paragraph("AWS Cloud Infrastructure & Services Architecture Brief", subtitle_style))
    
    # Metadata Pill Box
    meta_text = Paragraph(
        "<b>Project:</b> OpenShelf v1.0.0 &nbsp;&nbsp;|&nbsp;&nbsp; "
        "<b>Deployment:</b> Vercel Edge (Frontend) + AWS Cloud (Backend & Storage) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "<b>Tier:</b> 100% AWS Free Tier Verified",
        callout_style
    )
    meta_table = Table([[meta_text]], colWidths=[504])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Executive Overview
    story.append(Paragraph("Executive Overview", h1_style))
    story.append(Paragraph(
        "<b>OpenShelf</b> is a modern, community-driven digital library and revision platform for educational resources. "
        "To guarantee high availability, low latency, robust data isolation, and enterprise security at zero operational cost, "
        "OpenShelf leverages a hybrid architecture: a responsive, globally edge-cached React 19 frontend hosted on Vercel paired "
        "with an enterprise-grade backend infrastructure orchestrated across core <b>Amazon Web Services (AWS)</b> cloud primitives.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Architecture Overview Table
    arch_data = [
        [
            Paragraph("<b>Frontend (Vercel Edge)</b>", table_cell_bold),
            Paragraph("React 19, TypeScript, Tailwind CSS v4, DOMPurify client sanitization, SPA client-side routing.", table_cell_style)
        ],
        [
            Paragraph("<b>Compute (AWS EC2)</b>", table_cell_bold),
            Paragraph("Ubuntu 24.04 LTS (t2.micro), Node.js 22 LTS, Express REST API, Systemd daemon, Rate limiting.", table_cell_style)
        ],
        [
            Paragraph("<b>Persistence (AWS DynamoDB)</b>", table_cell_bold),
            Paragraph("Single-digit millisecond latency NoSQL tables for Users, Resources, Revisions, Feedback, and Moderation.", table_cell_style)
        ],
        [
            Paragraph("<b>Storage (AWS S3)</b>", table_cell_bold),
            Paragraph("Secure private object storage with temporary 15-minute Pre-signed URLs for zero-bandwidth doc streaming.", table_cell_style)
        ],
        [
            Paragraph("<b>Observability (AWS CloudWatch)</b>", table_cell_bold),
            Paragraph("Live HTTP status, p95/p99 latency percentiles, error rate tracking rendered on the frontend Insights panel.", table_cell_style)
        ],
        [
            Paragraph("<b>Pub/Sub (AWS SNS)</b>", table_cell_bold),
            Paragraph("Event-driven topics for resource update announcements and instant moderator review alerts.", table_cell_style)
        ],
    ]
    arch_table = Table(arch_data, colWidths=[150, 354])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 12))

    # Detailed AWS Services
    story.append(Paragraph("Detailed AWS Services Breakdown", h1_style))

    # 1. EC2
    story.append(Paragraph("1. Amazon EC2 (Elastic Compute Cloud)", h2_style))
    story.append(Paragraph(
        "Amazon EC2 provides secure, scalable virtual server compute capacity in the cloud.",
        body_style
    ))
    story.append(Paragraph("• <b>Instance Specifications:</b> Deployed on an <code>Ubuntu 24.04 LTS</code> AMI using the <code>t2.micro</code> instance size, qualifying under the AWS Free Tier (750 hours/month at $0 cost).", bullet_style))
    story.append(Paragraph("• <b>Systemd Process Daemon:</b> Managed by <code>openshelf.service</code> to provide continuous 24/7 uptime, background execution, auto-restart upon unexpected failures, and automated launch on instance reboot.", bullet_style))
    story.append(Paragraph("• <b>Network & Firewall Isolation:</b> Security groups restrict inbound ingress to SSH (Port 22), HTTPS (Port 443), HTTP (Port 80), and Node.js REST API traffic (Port 5000).", bullet_style))
    story.append(Spacer(1, 6))

    # 2. S3
    story.append(Paragraph("2. Amazon S3 (Simple Storage Service) & Pre-Signed URLs", h2_style))
    story.append(Paragraph(
        "Amazon S3 offers 99.999999999% (11 9's) data durability for high-throughput object storage.",
        body_style
    ))
    story.append(Paragraph("• <b>Private Bucket Architecture:</b> The bucket (<code>openshelf-learning-files</code>) enforces strict private access — public reads and writes are blocked by default.", bullet_style))
    story.append(Paragraph("• <b>Pre-Signed URL Security:</b> Direct client uploads and downloads are authorized through cryptographically signed temporary URLs generated via <code>@aws-sdk/s3-request-presigner</code> with a 15-minute TTL (Time-To-Live). This offloads document file transfers from the EC2 server and protects backend bandwidth.", bullet_style))
    story.append(Paragraph("• <b>Supported Formats:</b> Educational documents including PDF, DOCX, and PPTX with client-side magic-byte and MIME-type validation.", bullet_style))
    story.append(Spacer(1, 6))

    # 3. DynamoDB
    story.append(Paragraph("3. Amazon DynamoDB (Serverless NoSQL Database)", h2_style))
    story.append(Paragraph(
        "A serverless, distributed NoSQL key-value database delivering predictable single-digit millisecond latency.",
        body_style
    ))
    story.append(Paragraph("• <b>OpenShelf-Resources:</b> Educational resource metadata, academic subject classifications, format, download tallies, and star ratings.", bullet_style))
    story.append(Paragraph("• <b>OpenShelf-Users:</b> Profiles, hashed credentials, bookmarks, upload history, and Role-Based Access Control (RBAC) levels (<code>guest</code>, <code>learner</code>, <code>moderator</code>).", bullet_style))
    story.append(Paragraph("• <b>OpenShelf-Revisions:</b> Complete revision history with contributor attribution, version labels (v1.0, v2.0), and changelog notes.", bullet_style))
    story.append(Paragraph("• <b>OpenShelf-Feedback:</b> Constructive peer reviews, star ratings, and threaded replies.", bullet_style))
    story.append(Paragraph("• <b>OpenShelf-Moderation:</b> Flagged content reports, revision verification queues, and audit outcomes.", bullet_style))
    story.append(Paragraph("• <b>Capacity Model:</b> Operates on On-Demand / Pay-per-Request billing, fully enveloped by AWS's perpetual 25 GB free storage allocation.", bullet_style))
    story.append(Spacer(1, 6))

    # 4. CloudWatch
    story.append(Paragraph("4. Amazon CloudWatch (Observability & Live Telemetry)", h2_style))
    story.append(Paragraph(
        "Amazon CloudWatch monitors resource utilization, operational health, and real-time custom telemetry.",
        body_style
    ))
    story.append(Paragraph("• <b>Live Telemetry Tracker:</b> The frontend <i>Insights</i> view queries <code>/api/insights/aws-telemetry</code> to render live graphs of HTTP 2xx/4xx/5xx counts, active API throughput, and p95/p99 latency percentiles.", bullet_style))
    story.append(Paragraph("• <b>Centralized Logging:</b> Application logs stream to the <code>/aws/openshelf/api</code> log group for debugging, threat detection, and operational auditing.", bullet_style))
    story.append(Spacer(1, 6))

    # 5. SNS
    story.append(Paragraph("5. Amazon SNS (Simple Notification Service)", h2_style))
    story.append(Paragraph(
        "A managed pub/sub messaging service enabling asynchronous, event-driven notification dispatch.",
        body_style
    ))
    story.append(Paragraph("• <b>Resource Updates Topic:</b> Broadcasts notifications to subscribed learners when bookmarked study guides receive significant revisions or updates.", bullet_style))
    story.append(Paragraph("• <b>Moderation Alert Topic:</b> Instantly sends high-priority notifications to institutional moderators when resources are flagged by community members.", bullet_style))
    story.append(Spacer(1, 6))

    # 6. IAM & STS
    story.append(Paragraph("6. AWS Identity and Access Management (IAM) & AWS STS", h2_style))
    story.append(Paragraph(
        "Enforces least-privilege role boundaries and temporary cryptographic security tokens.",
        body_style
    ))
    story.append(Paragraph("• <b>IAM Instance Profile:</b> Configured via <code>deploy/aws-iam-policy.json</code> to grant the EC2 instance precise access to DynamoDB, S3, SNS, and CloudWatch without ever embedding static AWS secret keys in source code.", bullet_style))
    story.append(Paragraph("• <b>AWS STS Validation:</b> <code>npm run test:aws</code> executes <code>GetCallerIdentityCommand</code> against AWS STS to proactively authenticate connectivity and verify account identity.", bullet_style))
    story.append(Spacer(1, 6))

    # 7. Cognito
    story.append(Paragraph("7. Amazon Cognito (Identity & Access Management)", h2_style))
    story.append(Paragraph(
        "Provides customer identity pools and standards-based authentication (OAuth2 / OpenID Connect).",
        body_style
    ))
    story.append(Paragraph("• <b>Institutional SSO Readiness:</b> OpenShelf includes a turnkey provisioning script (<code>npm run init:cognito</code>) allowing institutions to federate student directories and enforce single sign-on alongside local JWT authentication.", bullet_style))
    story.append(Spacer(1, 6))

    # 8. Polly
    story.append(Paragraph("8. Amazon Polly (AI Text-to-Speech & Audio Narration)", h2_style))
    story.append(Paragraph(
        "Converts educational notes into natural-sounding speech for auditory learning and accessibility.",
        body_style
    ))
    story.append(Paragraph("• <b>Smart Reader Voice Player:</b> Powers in-reader audio narration with real-time MP3 streaming, voice selection, and soundwave animation.", bullet_style))
    story.append(Paragraph("• <b>A11y Compliance:</b> Ensures full WCAG compliance for visually impaired learners, backed by client-side audio caching for zero repeated AWS calls.", bullet_style))
    story.append(Spacer(1, 6))

    # 9. Translate
    story.append(Paragraph("9. Amazon Translate (Neural Machine Translation)", h2_style))
    story.append(Paragraph(
        "Provides instantaneous neural machine translation for educational documents across diverse languages.",
        body_style
    ))
    story.append(Paragraph("• <b>Multilingual Academic Reach:</b> Enables one-click translation into English, Spanish, German, Hindi, Tamil, and Malayalam.", bullet_style))
    story.append(Paragraph("• <b>Session Caching:</b> Client-side session storage caches translated pages to eliminate redundant cloud API calls.", bullet_style))
    story.append(Spacer(1, 12))

    # Comprehensive Summary Table
    story.append(PageBreak())
    story.append(Paragraph("AWS Service & Cost Profile Matrix", h1_style))
    matrix_data = [
        [
            Paragraph("<b>AWS Service</b>", table_header_style),
            Paragraph("<b>Category</b>", table_header_style),
            Paragraph("<b>Role in OpenShelf</b>", table_header_style),
            Paragraph("<b>AWS Free Tier Allowance</b>", table_header_style),
        ],
        [
            Paragraph("<b>Amazon EC2</b>", table_cell_bold),
            Paragraph("Compute", table_cell_style),
            Paragraph("Hosts Node.js API & systemd daemon 24/7", table_cell_style),
            Paragraph("750 hrs/month (t2.micro / t3.micro)", table_cell_style),
        ],
        [
            Paragraph("<b>Amazon S3</b>", table_cell_bold),
            Paragraph("Object Storage", table_cell_style),
            Paragraph("Private document storage via Pre-signed URLs", table_cell_style),
            Paragraph("5 GB standard storage + 20K GET requests", table_cell_style),
        ],
        [
            Paragraph("<b>Amazon DynamoDB</b>", table_cell_bold),
            Paragraph("NoSQL DB", table_cell_style),
            Paragraph("Stores users, resources, revisions & feedback", table_cell_style),
            Paragraph("25 GB storage + 200M monthly requests", table_cell_style),
        ],
        [
            Paragraph("<b>Amazon CloudWatch</b>", table_cell_bold),
            Paragraph("Observability", table_cell_style),
            Paragraph("Live telemetry tracker & system health", table_cell_style),
            Paragraph("10 custom metrics + 5 GB log ingestion", table_cell_style),
        ],
        [
            Paragraph("<b>Amazon SNS</b>", table_cell_bold),
            Paragraph("Pub/Sub", table_cell_style),
            Paragraph("Event-driven alerts for moderation & updates", table_cell_style),
            Paragraph("1,000,000 monthly publish requests", table_cell_style),
        ],
        [
            Paragraph("<b>AWS IAM / STS</b>", table_cell_bold),
            Paragraph("Security", table_cell_style),
            Paragraph("Least-privilege role-based access control", table_cell_style),
            Paragraph("100% Free (Native AWS feature)", table_cell_style),
        ],
        [
            Paragraph("<b>Amazon Polly</b>", table_cell_bold),
            Paragraph("AI / Audio", table_cell_style),
            Paragraph("Smart Reader text-to-speech audio narration", table_cell_style),
            Paragraph("5M chars/month free (Standard voices)", table_cell_style),
        ],
        [
            Paragraph("<b>Amazon Translate</b>", table_cell_bold),
            Paragraph("AI / NLP", table_cell_style),
            Paragraph("Instant multilingual document translation", table_cell_style),
            Paragraph("2M chars/month free (Neural engine)", table_cell_style),
        ],
    ]
    matrix_table = Table(matrix_data, colWidths=[95, 75, 185, 149])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(matrix_table)
    story.append(Spacer(1, 14))

    # Conclusion & Sign-off
    story.append(Paragraph(
        "<b>Architectural Conclusion:</b> OpenShelf demonstrates a production-grade, zero-cost cloud design pattern by decoupling "
        "the presentation layer (Vercel Edge CDN) from the API and persistence tiers (AWS EC2, DynamoDB, S3, CloudWatch). "
        "All cloud resources are strictly calibrated to operate within the perpetual and introductory AWS Free Tier quotas, "
        "offering zero upfront cost while maintaining enterprise security, resilience, and unlimited scalability.",
        body_style
    ))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF generated at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_pdf()
