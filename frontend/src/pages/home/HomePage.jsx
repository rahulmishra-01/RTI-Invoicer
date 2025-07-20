import React from "react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";
import invoiceCreationImage from "../../assets/images/invoiceCreation.png";
import invoiceManagementImage from "../../assets/images/invoiceManagement.png";
import smartDashboardImage from "../../assets/images/smartDashboard.png";

const HomePage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroHeading}>Simplify Your Invoicing with <br />RTI Invoice Maker</h1>
        <p className={styles.heroPara}>
          Create professional invoices in minutes. Track payments, manage clients, and
          keep your business finances organized — all in one place.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/create">
            <button className={[styles.btn,styles.green].join(" ")}>Get Started</button>
          </Link>
          <Link to="/dashboard">
            <button className={[styles.btn,styles.green,styles.greenOutline].join(" ")}>View Dashboard</button>
          </Link>
        </div>
      </div>

      <section className={styles.features}>
        <h2 className={styles.featuresHeading}>Why Choose Us?</h2>
        <div className={styles.featureCards}>
          {/* Card 1 */}
          <div className={styles.featureCard}>
            <div className={styles.imagePlaceholder}>
                <img className={styles.imagePlaceholderImage} src={invoiceCreationImage} />
            </div>
            <h3>Invoice Creation</h3>
            <p>Create beautifully crafted invoices with just a few clicks. Customize your fields, logo, and taxes.</p>
            <span className={styles.tag}>INVOICE CREATION</span>
          </div>

          {/* Card 2 */}
          <div className={styles.featureCard}>
            <div className={styles.imagePlaceholder}>
                <img className={styles.imagePlaceholderImage} src={invoiceManagementImage} />
            </div>
            <h3>Invoice Management</h3>
            <p>Manage, download, and delete invoices. They’re safe, quick, and professional.</p>
            <span className={styles.tag}>INVOICE MANAGEMENT</span>
          </div>

          {/* Card 3 */}
          <div className={styles.featureCard}>
            <div className={styles.imagePlaceholder}>
                <img className={styles.imagePlaceholderImage} src={smartDashboardImage} />
            </div>
            <h3>Smart Dashboard</h3>
            <p>Access your most recent data, pending billing, status and key analytics section. Everything is securely stored and organized.</p>
            <span className={styles.tag}>DASHBOARD</span>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.mainFooter}>
          <div className={styles.footerLeft}>
          <h3 className={styles.footerLogo}>RTI INVOICER</h3>
          <p>RTI Invoicer is a free tool to generate GST invoices and manage clients.</p>
        </div>

        <div className={styles.footerLinks}>
          {/* <div>
            <h4 className={styles.footerLinksHeadings }>COMPANY</h4>
            <p>About</p>
            <p>Blog</p>
          </div>
          <div>
            <h4 className={styles.footerLinksHeadings }>RESOURCES</h4>
            <p>Support</p>
            <p>Privacy Policy</p>
          </div> */}
          <div>
            <h4 className={styles.footerLinksHeadings }>Contact Us</h4>
            <p>rtiinvoicer@email.com</p>
            <p>+91 9876543210</p>
          </div>
          {/* <div>
            <h4 className={styles.footerLinksHeadings }>SOCIAL</h4>
            <p>Twitter</p>
            <p>LinkedIn</p>
          </div> */}
        </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} RTI Invoicer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
