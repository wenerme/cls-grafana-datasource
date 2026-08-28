package main

import "testing"

func TestNormalizeSignOptsDefaultsCLSVersion(t *testing.T) {
	for _, version := range []string{"", "invalid-version"} {
		opts := signOpts{
			Service: " CLS ",
			Version: version,
		}

		normalizeSignOpts(&opts)

		if opts.Service != "cls" {
			t.Fatalf("Service = %q, want %q", opts.Service, "cls")
		}
		if opts.Version != clsAPIVersion {
			t.Fatalf("Version = %q, want %q", opts.Version, clsAPIVersion)
		}
	}
}

func TestNormalizeSignOptsPreservesNonCLSVersion(t *testing.T) {
	opts := signOpts{
		Service: " Monitor ",
		Version: " 2018-07-24 ",
	}

	normalizeSignOpts(&opts)

	if opts.Service != "monitor" {
		t.Fatalf("Service = %q, want %q", opts.Service, "monitor")
	}
	if opts.Version != "2018-07-24" {
		t.Fatalf("Version = %q, want %q", opts.Version, "2018-07-24")
	}
}
