import { Linking, Platform } from "react-native";

interface ConfigurationIssue {
  level: "error" | "warning" | "info";
  category: "redirect" | "environment" | "auth" | "general";
  message: string;
  solution: string;
  technicalDetails?: any;
}

interface ConfigurationReport {
  isValid: boolean;
  issues: ConfigurationIssue[];
  environment: {
    currentUrl: string | null;
    expectedRedirectUrl: string;
    isEmulator: boolean;
    isProduction: boolean;
    platform: string;
  };
  recommendations: string[];
}

export class SupabaseConfigChecker {
  private static instance: SupabaseConfigChecker;

  static getInstance(): SupabaseConfigChecker {
    if (!SupabaseConfigChecker.instance) {
      SupabaseConfigChecker.instance = new SupabaseConfigChecker();
    }
    return SupabaseConfigChecker.instance;
  }

  /**
   * Generates a comprehensive configuration report
   */
  async generateReport(): Promise<ConfigurationReport> {
    const issues: ConfigurationIssue[] = [];
    const environment = await this.analyzeEnvironment();

    this.checkRedirectConfiguration(issues, environment);
    this.checkEnvironmentVariables(issues);
    this.checkUrlPatterns(issues, environment);

    const recommendations = this.generateRecommendations(issues, environment);

    return {
      isValid: issues.filter((i) => i.level === "error").length === 0,
      issues,
      environment,
      recommendations,
    };
  }

  private async analyzeEnvironment() {
    const initialUrl = await Linking.getInitialURL();
    const isEmulator =
      initialUrl?.includes("localhost") ||
      initialUrl?.includes("127.0.0.1") ||
      false;

    const isProduction = !isEmulator;
    const expectedRedirectUrl = "myapp://reset-password"; // deep link configurado no Supabase

    return {
      currentUrl: initialUrl,
      expectedRedirectUrl,
      isEmulator,
      isProduction,
      platform: Platform.OS,
    };
  }

  private checkRedirectConfiguration(
    issues: ConfigurationIssue[],
    environment: any
  ) {
    if (
      environment.currentUrl &&
      environment.currentUrl.includes("reset-password")
    ) {
      const hasTokens =
        environment.currentUrl.includes("access_token") ||
        environment.currentUrl.includes("refresh_token");

      if (!hasTokens) {
        issues.push({
          level: "error",
          category: "redirect",
          message: "On reset-password screen but no authentication tokens found",
          solution:
            "Verify that the Site URL and Redirect URLs are correctly configured in Supabase Dashboard > Authentication > URL Configuration",
          technicalDetails: {
            currentUrl: environment.currentUrl,
            expectedTokens: ["access_token", "refresh_token", "type=recovery"],
          },
        });
      }
    }
  }

  private checkEnvironmentVariables(issues: ConfigurationIssue[]) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      issues.push({
        level: "error",
        category: "environment",
        message: "Supabase URL not configured",
        solution: "Ensure EXPO_PUBLIC_SUPABASE_URL is properly set in app config",
      });
    }
  }

  private checkUrlPatterns(
    issues: ConfigurationIssue[],
    environment: any
  ) {
    if (environment.isEmulator) {
      issues.push({
        level: "info",
        category: "redirect",
        message: "Running on emulator/local environment",
        solution: `Ensure Supabase Redirect URL includes your deep link: ${environment.expectedRedirectUrl}`,
      });
    } else {
      issues.push({
        level: "info",
        category: "redirect",
        message: "Running on production device",
        solution: `Ensure Supabase Redirect URL includes: ${environment.expectedRedirectUrl}`,
      });
    }
  }

  private generateRecommendations(
    issues: ConfigurationIssue[],
    environment: any
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(
      "Go to Supabase Dashboard > Authentication > URL Configuration"
    );
    recommendations.push(`Set Site URL to: ${environment.expectedRedirectUrl}`);
    recommendations.push(`Add Redirect URL: ${environment.expectedRedirectUrl}`);
    recommendations.push("Test the password reset flow on a physical device");
    recommendations.push(
      "Ensure deep linking is properly configured in app.json (Expo) or Android/iOS manifests"
    );

    return recommendations;
  }

  /**
   * Logs a detailed configuration report
   */
  async logReport(): Promise<void> {
    const report = await this.generateReport();

    console.group("🔧 Supabase Configuration Report");
    console.log("Overall Status:", report.isValid ? "✅ Valid" : "❌ Issues Found");

    console.group("🌍 Environment Analysis");
    console.table(report.environment);
    console.groupEnd();

    if (report.issues.length > 0) {
      console.group("⚠️ Issues Found");
      report.issues.forEach((issue, index) => {
        const icon =
          issue.level === "error"
            ? "❌"
            : issue.level === "warning"
            ? "⚠️"
            : "ℹ️";
        console.group(`${icon} ${issue.category.toUpperCase()} - ${issue.message}`);
        console.log("Solution:", issue.solution);
        if (issue.technicalDetails) {
          console.log("Technical Details:", issue.technicalDetails);
        }
        console.groupEnd();
      });
      console.groupEnd();
    }

    console.group("💡 Recommendations");
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.groupEnd();

    console.groupEnd();
  }

  async getConfigurationSummary(): Promise<string> {
    const report = await this.generateReport();
    const errorCount = report.issues.filter((i) => i.level === "error").length;

    if (errorCount === 0) {
      return "Configuration appears correct. If issues persist, verify deep link settings.";
    }

    return `${errorCount} configuration issue(s) detected. Check console for details or follow the setup guide.`;
  }

  async isLikelyConfigurationIssue(): Promise<boolean> {
    const url = await Linking.getInitialURL();
    return !!(url?.includes("reset-password") && !url.includes("access_token"));
  }
}

// Export singleton
export const configChecker = SupabaseConfigChecker.getInstance();

// Auto-log in dev
if (__DEV__) {
  setTimeout(() => {
    configChecker.logReport();
  }, 1000);
}
