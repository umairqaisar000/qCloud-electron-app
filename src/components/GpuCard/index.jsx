import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { addJob, setJobState, updateJob } from "../../reducers/gpuDataSlice";
import { SecondaryButton } from "qlu-20-ui-library";
import GpuLogo from "../../assets/Group.svg";
import "./style.scss";

const SERVER_URL = import.meta.env.VITE_APP_SERVER_URL;

const GpuCard= ({
  gpu,
  peer_key,
  showTerminal,
  setShowTerminal,
  peerId,
  setSelectedGpu,
  ram,
  cpu,
  started,
  finished,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const jobState = useSelector((state) => state.gpuData.job_state);
  const dispatch = useDispatch();
  const handleGpuConnect = async () => {
    try {
      setIsLoading(true);

      const resp = await fetch(
        SERVER_URL +
          "gpu-data/start_ssh?key=" +
          encodeURIComponent(peer_key) +
          "&peer_id=" +
          encodeURIComponent(peerId),
        {
          method: "GET",
          headers: {
            authorization: JSON.parse(localStorage.getItem("xhqr")).token,
          },
        }
      )
        .then((r) => {
          setShowTerminal(true);
          return r.json();
        })
        .catch((error) => console.error("Error:", error));

      if (resp.success) {
        dispatch(setJobState(resp.data.gpu_data));
        dispatch(addJob(resp.data.job_data));
      }
    } catch (e) {
      console.log(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDockerStop = async (peerId) => {
    try {
      // setIsLoading(true);
      setShowTerminal(false);
      const resp = await fetch(
        SERVER_URL + "gpu-data/stop_ssh?key=" + encodeURIComponent(peerId),
        {
          method: "GET",
          headers: {
            authorization: JSON.parse(localStorage.getItem("xhqr")).token,
          },
        }
      )
        .then((r) => r.json())
        .catch((error) => console.error("Error:", error));

      if (resp.success) {
        dispatch(updateJob(resp.data.job_data));
        dispatch(
          setJobState({
            started: false,
            finished: true,
            ssh_data: {},
          })
        );
      }
    } catch (e) {
      console.log(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const setParams = () => {
      setSelectedGpu({
        gpu_name: gpu?.name,
        vram_free: gpu?.free,
        vram_used: gpu?.used,
        status: "connected",
      });
    };
    setParams();
  }, []);

  return (
    <Card className="gpuNodeContainer">
      <CardContent>
        <>
          <div className="text-primary">GPU {parseInt(peer_key) + 1}</div>
          <div className="text-primary">
            {gpu.name ? gpu.name : "No Gpu found"}
          </div>
          <div className="gpu-logo">
            <img src={GpuLogo} alt="GPU Logo" />
          </div>
          <div>
            <span className="text-secondary">VRAM </span>
            <span className="text-primary" style={{ marginLeft: "12px" }}>
              {parseInt(gpu.total) / 1024} GB
            </span>
          </div>
          <div>
            <span className="text-secondary">RAM </span>
            <span className="text-primary" style={{ marginLeft: "12px" }}>
              {Math.round(parseInt(ram.free) / 1024)} GB
            </span>
          </div>
          <div>
            <span className="text-secondary">CPU Usage </span>
            <span className="text-primary" style={{ marginLeft: "12px" }}>
              {cpu}
            </span>
          </div>
          {/* {gpu.name && (
            <>
              <Typography color="body2" gutterBottom>
                VRAM
              </Typography>
              <Typography color="body2" gutterBottom>
                <div className="text-primary">{`GPU: ${gpu.name}`}</div>
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                <div className="text-primary">{`Free: ${gpu.free} MB`}</div>
                <br></br>
                <div className="text-primary">{`Used: ${gpu.used} MB`}</div>
                <br></br>
                <div className="text-primary">{`Total: ${gpu.total} MB`}</div>
              </Typography>
            </>
          )} */}
        </>
        {/* <Typography color="body2" gutterBottom>
          RAM
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          <div className="text-primary">{`Free: ${ram.free} MB`}</div>
          <div className="text-primary">{`Used: ${ram.used} MB`}</div>
        </Typography>
        <br></br>
        <Typography color="body2" gutterBottom>
          CPU Usage
        </Typography>
        <Typography color="body2" gutterBottom>
          <div className="text-primary">{`Used: ${cpu}`}</div>
        </Typography> */}
        {/* {console.log("STATE:", jobState, showTerminal)} */}
        {showTerminal && jobState?.key === peer_key && (
          <>
            {!isLoading && (
              <SecondaryButton
                onClick={() => handleDockerStop(peerId)}
                color="primary"
                variant="contained"
                component="span"
                style={{ marginLeft: "10px" }}
              >
                Stop
              </SecondaryButton>
            )}
          </>
        )}
        {isLoading ? (
          <>
            <br />
            <CircularProgress />
          </>
        ) : (
          !showTerminal &&
          parseInt(jobState?.key) !== peer_key && (
            <div className="btn-section">
              <SecondaryButton
                onClick={handleGpuConnect}
                color="secondary"
                colorVariant="orange"
                sizeVariant="sm"
                component="span"
                className="callButton"
              >
                Connect
              </SecondaryButton>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default GpuCard;