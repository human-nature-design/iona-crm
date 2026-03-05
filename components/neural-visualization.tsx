"use client";

import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type p5 from "p5";

interface Node {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  id: number;
  type: string;
  radius: number;
  hoverRange: number;
  hoverSpeed: number;
  offset: number;
}

interface Connection {
  node1: Node;
  node2: Node;
  type: string;
  baseWeight: number;
  weightVariation: number;
  pulseSpeed: number;
  offset: number;
  weight?: number;
}

function NeuralVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Function to get responsive dimensions
  const getCanvasDimensions = () => {
    if (typeof window === "undefined") return { width: 800, height: 600 };
    
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const maxWidth = Math.min(containerWidth * 0.95, 800); // Use 95% of container width, max 800px (original size)
    const minWidth = 320; // Minimum width for mobile
    const width = Math.max(minWidth, maxWidth);
    
    // Maintain aspect ratio (4:3) and cap at original height
    const height = Math.min((width * 3) / 4, 600);
    
    return { width, height };
  };

  useEffect(() => {
    // Handle resize
    const handleResize = () => {
      const newDimensions = getCanvasDimensions();
      setDimensions(newDimensions);
      
      if (p5InstanceRef.current) {
        p5InstanceRef.current.resizeCanvas(newDimensions.width, newDimensions.height);
      }
    };

    handleResize(); // Set initial dimensions
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let mounted = true;
    
    const loadP5 = async () => {
      if (!mounted || p5InstanceRef.current) return;
      
      const p5 = (await import("p5")).default;
    let blueNodes: Node[] = [];
    let blueConnections: Connection[] = [];
    let redNodes: Node[] = [];
    let redConnections: Connection[] = [];
    let time = 0;
    let canvasWidth = dimensions.width;
    let canvasHeight = dimensions.height;

    const sketch = (p: p5) => {
      // Scale factor based on canvas size (800x600 is the base design)
      const getScaleFactor = () => Math.min(canvasWidth / 800, canvasHeight / 600);

      const createNode = (baseX: number, baseY: number, id: number, type: string): Node => {
        const scale = getScaleFactor();
        return {
          baseX: (baseX * canvasWidth) / 800,
          baseY: (baseY * canvasHeight) / 600,
          x: (baseX * canvasWidth) / 800,
          y: (baseY * canvasHeight) / 600,
          id: id,
          type: type,
          radius: 12 * scale,
          hoverRange: 2 * scale,
          hoverSpeed: p.random(0.5, 1.5),
          offset: p.random(p.TWO_PI),
        };
      };

      const createConnection = (node1: Node, node2: Node, type: string): Connection => {
        const scale = getScaleFactor();
        return {
          node1: node1,
          node2: node2,
          type: type,
          baseWeight: p.random(1, 3) * scale,
          weightVariation: p.random(0.5, 1.5) * scale,
          pulseSpeed: p.random(0.8, 1.2),
          offset: p.random(p.TWO_PI),
        };
      };

      const updateNode = (node: Node, time: number) => {
        node.x = node.baseX + p.sin(time * node.hoverSpeed + node.offset) * node.hoverRange;
        node.y = node.baseY + p.cos(time * node.hoverSpeed * 0.8 + node.offset) * node.hoverRange * 0.5;
      };

      const displayNode = (node: Node) => {
        if (node.type === "blue") {
          p.fill(80, 80, 255);
        } else {
          p.fill(255, 60, 60);
        }
        p.noStroke();
        p.circle(node.x, node.y, node.radius * 2);
      };

      const updateConnection = (connection: Connection, time: number) => {
        connection.weight = connection.baseWeight + p.sin(time * connection.pulseSpeed + connection.offset) * connection.weightVariation;
      };

      const displayConnection = (connection: Connection) => {
        if (connection.type === "blue") {
          p.stroke(80, 80, 255, 150);
        } else {
          p.stroke(255, 60, 60, 150);
        }
        p.strokeWeight(connection.weight || 1);
        p.line(connection.node1.x, connection.node1.y, connection.node2.x, connection.node2.y);
      };

      const drawAnnotations = () => {
        const scale = getScaleFactor();
        const fontSize = Math.max(8, 11 * scale);
        
        p.textFont("IBM Plex Mono");
        p.textSize(fontSize);
        p.textAlign(p.LEFT, p.CENTER);
        
        p.stroke(100, 100, 100);
        p.strokeWeight(0.5 * scale);
        p.fill(100, 100, 100);
        
        // Right triangle cluster - "strong fit"
        let rightTriangleX = (580 * canvasWidth) / 800;
        let rightTriangleY = (350 * canvasHeight) / 600;
        let rightLabelX = Math.min((700 * canvasWidth) / 800, canvasWidth - 100 * scale);
        let rightLabelY = (350 * canvasHeight) / 600;
        
        p.line(rightTriangleX, rightTriangleY, rightLabelX - 5 * scale, rightLabelY);
        p.noStroke();
        p.text("STRONG FIT", rightLabelX, rightLabelY);
        
        // Top cluster/triangle - "medium fit"
        p.stroke(100, 100, 100);
        p.strokeWeight(0.5 * scale);
        let topTriangleX = (370 * canvasWidth) / 800;
        let topTriangleY = (150 * canvasHeight) / 600;
        let topLabelX = Math.max((100 * canvasWidth) / 800, 10);
        let topLabelY = (100 * canvasHeight) / 600;
        
        p.line(topTriangleX, topTriangleY, topLabelX + 80 * scale, topLabelY);
        p.noStroke();
        p.text("MEDIUM FIT", topLabelX, topLabelY);
        
        // Left blue quadrilateral - "opportunity space"
        p.stroke(100, 100, 100);
        p.strokeWeight(0.5 * scale);
        let leftQuadX = (235 * canvasWidth) / 800;
        let leftQuadY = (325 * canvasHeight) / 600;
        let leftLabelX = Math.max((50 * canvasWidth) / 800, 10);
        let leftLabelY = (450 * canvasHeight) / 600;
        
        p.line(leftQuadX, leftQuadY, leftLabelX + 110 * scale, leftLabelY);
        p.noStroke();
        p.text("OPPORTUNITY SPACE", leftLabelX, leftLabelY);
      };

      const initializeNetwork = () => {
        blueNodes = [];
        blueConnections = [];
        redNodes = [];
        redConnections = [];
        
        // Create blue network nodes (using original 800x600 coordinates, will be scaled)
        let xOffset = 0;
        
        // Top triangle
        blueNodes.push(createNode(360 + xOffset, 190, 0, "blue"));
        blueNodes.push(createNode(300 + xOffset, 220, 1, "blue"));
        blueNodes.push(createNode(430 + xOffset, 220, 2, "blue"));
        blueNodes.push(createNode(380 + xOffset, 220, 3, "blue"));
        blueNodes.push(createNode(410 + xOffset, 220, 4, "blue"));
        
        // Central spine
        blueNodes.push(createNode(360 + xOffset, 280, 5, "blue"));
        
        // Left quadrilateral
        blueNodes.push(createNode(180 + xOffset, 280, 6, "blue"));
        blueNodes.push(createNode(240 + xOffset, 320, 7, "blue"));
        blueNodes.push(createNode(190 + xOffset, 370, 8, "blue"));
        blueNodes.push(createNode(280 + xOffset, 370, 9, "blue"));
        
        // Right triangle
        blueNodes.push(createNode(400 + xOffset, 440, 10, "blue"));
        blueNodes.push(createNode(560 + xOffset, 280, 11, "blue"));
        blueNodes.push(createNode(560 + xOffset, 370, 12, "blue"));
        
        // Create blue connections
        blueConnections.push(createConnection(blueNodes[0], blueNodes[1], "blue"));
        blueConnections.push(createConnection(blueNodes[0], blueNodes[2], "blue"));
        blueConnections.push(createConnection(blueNodes[1], blueNodes[2], "blue"));
        blueConnections.push(createConnection(blueNodes[0], blueNodes[4], "blue"));
        blueConnections.push(createConnection(blueNodes[0], blueNodes[5], "blue"));
        blueConnections.push(createConnection(blueNodes[1], blueNodes[3], "blue"));
        blueConnections.push(createConnection(blueNodes[2], blueNodes[3], "blue"));
        blueConnections.push(createConnection(blueNodes[3], blueNodes[4], "blue"));
        blueConnections.push(createConnection(blueNodes[3], blueNodes[5], "blue"));
        blueConnections.push(createConnection(blueNodes[3], blueNodes[8], "blue"));
        blueConnections.push(createConnection(blueNodes[4], blueNodes[5], "blue"));
        blueConnections.push(createConnection(blueNodes[5], blueNodes[6], "blue"));
        blueConnections.push(createConnection(blueNodes[6], blueNodes[7], "blue"));
        blueConnections.push(createConnection(blueNodes[7], blueNodes[5], "blue"));
        blueConnections.push(createConnection(blueNodes[8], blueNodes[9], "blue"));
        blueConnections.push(createConnection(blueNodes[8], blueNodes[10], "blue"));
        blueConnections.push(createConnection(blueNodes[9], blueNodes[10], "blue"));
        blueConnections.push(createConnection(blueNodes[10], blueNodes[11], "blue"));
        blueConnections.push(createConnection(blueNodes[11], blueNodes[12], "blue"));
        
        // Create red network nodes
        xOffset = 0;
        
        // Top star/hub node
        redNodes.push(createNode(400 + xOffset, 150, 0, "red"));
        
        // Star branches from top hub
        redNodes.push(createNode(400 + xOffset, 80, 1, "red"));
        redNodes.push(createNode(340 + xOffset, 120, 2, "red"));
        redNodes.push(createNode(460 + xOffset, 120, 3, "red"));
        redNodes.push(createNode(340 + xOffset, 180, 4, "red"));
        redNodes.push(createNode(460 + xOffset, 180, 5, "red"));
        
        // Middle connection node
        redNodes.push(createNode(400 + xOffset, 300, 6, "red"));
        
        // Bottom triangle cluster
        redNodes.push(createNode(400 + xOffset, 450, 7, "red"));
        redNodes.push(createNode(560 + xOffset, 280, 8, "red"));
        redNodes.push(createNode(560 + xOffset, 370, 9, "red"));
        
        // Create red connections
        redConnections.push(createConnection(redNodes[0], redNodes[1], "red"));
        redConnections.push(createConnection(redNodes[0], redNodes[2], "red"));
        redConnections.push(createConnection(redNodes[0], redNodes[3], "red"));
        redConnections.push(createConnection(redNodes[0], redNodes[4], "red"));
        redConnections.push(createConnection(redNodes[0], redNodes[5], "red"));
        redConnections.push(createConnection(redNodes[0], redNodes[6], "red"));
        redConnections.push(createConnection(redNodes[6], redNodes[7], "red"));
        redConnections.push(createConnection(redNodes[7], redNodes[8], "red"));
        redConnections.push(createConnection(redNodes[7], redNodes[9], "red"));
        redConnections.push(createConnection(redNodes[8], redNodes[9], "red"));
      };

      p.setup = () => {
        canvasWidth = dimensions.width;
        canvasHeight = dimensions.height;
        p.createCanvas(canvasWidth, canvasHeight);
        initializeNetwork();
      };

      // Add a method to handle canvas resize
      p.windowResized = () => {
        canvasWidth = dimensions.width;
        canvasHeight = dimensions.height;
        p.resizeCanvas(canvasWidth, canvasHeight);
        initializeNetwork(); // Recreate nodes with new positions
      };

      p.draw = () => {
        p.clear();
        
        time += 0.02;
        
        // Update and draw blue connections
        for (let connection of blueConnections) {
          updateConnection(connection, time);
          displayConnection(connection);
        }
        
        // Update and draw red connections
        for (let connection of redConnections) {
          updateConnection(connection, time);
          displayConnection(connection);
        }
        
        // Update and draw blue nodes
        for (let node of blueNodes) {
          updateNode(node, time);
          displayNode(node);
        }
        
        // Update and draw red nodes
        for (let node of redNodes) {
          updateNode(node, time);
          displayNode(node);
        }
        
        // Draw annotations
        drawAnnotations();
      };
    };

      if (containerRef.current && mounted) {
        p5InstanceRef.current = new p5(sketch, containerRef.current);
      }
    };
    
    loadP5();
    
    return () => {
      mounted = false;
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [dimensions]);

  return (
    <div className="flex justify-center items-center w-full px-4">
      <div className="relative w-full max-w-[800px]">
        <div ref={containerRef} className="w-full" />
        {/* Transparent overlay to prevent touch interference on mobile */}
        <div 
          className="absolute inset-0 bg-transparent pointer-events-auto" 
          style={{ touchAction: 'pan-y' }}
        />
      </div>
    </div>
  );
}

export default NeuralVisualization;