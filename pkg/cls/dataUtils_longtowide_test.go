package cls

import (
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	clsAPI "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/cls/v20201016"
)

// Alerting (SSE) requires wide time series. QueryLog converts analysis frames
// with data.LongToWide, so nullable fields must still convert cleanly.
func TestTransferAnalysisRecordsToFrameNullableLongToWide(t *testing.T) {
	name := func(s string) *string { return &s }
	cols := []clsAPI.Column{
		{Name: name("t"), Type: name("timestamp")},
		{Name: name("model"), Type: name("varchar")},
		{Name: name("v"), Type: name("double")},
	}
	list := []map[string]interface{}{
		{"t": "2026-10-10 10:00:00", "model": "a", "v": 1.0},
		{"t": "2026-10-10 10:00:00", "model": "b", "v": nil},
		{"t": "2026-10-10 10:01:00", "model": "a", "v": 2.0},
	}

	frame := TransferAnalysisRecordsToFrame(list, cols, "", "", time.UTC)[0]
	if got := frame.TimeSeriesSchema().Type; got != data.TimeSeriesTypeLong {
		t.Fatalf("schema = %v, want long", got)
	}

	wide, err := data.LongToWide(frame, nil)
	if err != nil {
		t.Fatalf("LongToWide: %v", err)
	}
	if got := wide.TimeSeriesSchema().Type; got != data.TimeSeriesTypeWide {
		t.Fatalf("wide schema = %v, want wide", got)
	}
	if len(wide.Fields) != 3 {
		t.Fatalf("wide fields = %d, want 3 (time + v{model=a} + v{model=b})", len(wide.Fields))
	}
}
